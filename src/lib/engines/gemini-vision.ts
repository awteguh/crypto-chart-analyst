// src/lib/engines/gemini-vision.ts

import { GoogleGenAI } from '@google/genai'
import type { AnalysisResult, MtfSynthesis } from '@/types/analysis'
import { buildSingleChartPrompt } from '@/lib/prompts/single-chart'
import { buildMtfSynthesisPrompt } from '@/lib/prompts/mtf-chart'
import { validateConsistency, normalizeOverlay } from './validate'

// gemini-2.0-flash & gemini-1.5-flash: dihapus dari API (June 2026).
// gemini-2.5-flash-lite: paling murah, free quota, sering 503 karena overload.
// gemini-2.5-flash: lebih stabil, free quota ~20 req/day, dipakai saat lite 503.
// Urutan: coba lite dulu (lebih murah), fallback ke flash jika 503/UNAVAILABLE.
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash']

// Cooldown sederhana per model — hindari spam model yang sedang down.
// Key: model name, Value: timestamp ketika model gagal terakhir kali.
const modelCooldown = new Map<string, number>()
const COOLDOWN_MS = 60_000 // 1 menit cooldown setelah model gagal dengan 503

function isOnCooldown(model: string): boolean {
  const last = modelCooldown.get(model)
  if (!last) return false
  return Date.now() - last < COOLDOWN_MS
}

function setCooldown(model: string): void {
  modelCooldown.set(model, Date.now())
}

function getClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
}

// Ambil teks JSON dari respons Gemini, buang pembungkus markdown ```json jika ada.
function extractJson(text: string): string {
  let t = text.trim()
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  }
  // Ambil dari kurung kurawal pertama sampai terakhir (jaga-jaga ada teks lain)
  const first = t.indexOf('{')
  const last = t.lastIndexOf('}')
  if (first !== -1 && last !== -1) {
    t = t.slice(first, last + 1)
  }
  return t.trim()
}

export async function analyzeWithGemini(
  imageBase64: string,
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp',
  timeframe?: string
): Promise<AnalysisResult> {
  const ai = getClient()
  const errors: string[] = []

  for (const model of MODELS) {
    // Skip model yang sedang cooldown (baru gagal 503 dalam 1 menit terakhir)
    if (isOnCooldown(model)) {
      console.warn(`[gemini] Skipping ${model} (cooldown aktif)`)
      errors.push(`[${model}] cooldown — skip`)
      continue
    }

    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType, data: imageBase64 } },
              { text: buildSingleChartPrompt(timeframe) },
            ],
          },
        ],
        config: { responseMimeType: 'application/json', temperature: 0.1 },
      })

      const text = response.text ?? ''
      const parsed = JSON.parse(extractJson(text))

      if (parsed.error) {
        throw new Error(parsed.error)
      }

      parsed.overlay = normalizeOverlay(parsed.overlay ?? null)
      parsed.engine_used = 'gemini-vision'

      return validateConsistency(parsed as AnalysisResult)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // Cek apakah error adalah 503 UNAVAILABLE atau RESOURCE_EXHAUSTED (rate limit) — coba model berikutnya
      const isRetryable =
        msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('RESOURCE_EXHAUSTED')
      console.warn(`[gemini] Model ${model} gagal (retryable=${isRetryable}):`, msg)
      errors.push(`[${model}] ${msg}`)
      if (isRetryable) {
        setCooldown(model) // tandai cooldown supaya request berikutnya langsung skip
      } else {
        break // error permanen (mis. invalid API key) — jangan coba model lain
      }
    }
  }

  throw new Error(errors.join(' | '))
}

export async function synthesizeMtfWithGemini(
  results: Partial<Record<string, AnalysisResult>>
): Promise<MtfSynthesis> {
  const ai = getClient()

  const response = await ai.models.generateContent({
    model: MODELS[0],
    contents: [{ role: 'user', parts: [{ text: buildMtfSynthesisPrompt(results) }] }],
    config: { responseMimeType: 'application/json', temperature: 0.1 },
  })

  const text = response.text ?? ''
  return JSON.parse(extractJson(text)) as MtfSynthesis
}
