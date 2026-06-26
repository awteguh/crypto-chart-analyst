// src/lib/engines/openrouter-vision.ts
// OpenRouter: gateway ke 100+ model AI via OpenAI-compatible API.
// Dokumentasi: https://openrouter.ai/docs

import type { AnalysisResult, MtfSynthesis } from '@/types/analysis'
import { buildSingleChartPrompt } from '@/lib/prompts/single-chart'
import { buildMtfSynthesisPrompt } from '@/lib/prompts/mtf-chart'
import { validateConsistency, normalizeOverlay } from './validate'

// Model list — gratis dan mendukung vision (image input).
// "openrouter/free" = router otomatis OpenRouter, pilih model gratis yang tersedia saat itu.
//   Keuntungan: tidak perlu tebak model mana yang sedang rate-limited.
//   Catatan: tidak selalu memilih model yang support vision — oleh karena itu ada fallback eksplisit.
// Free vision models yang dikonfirmasi tersedia (Juni 2026):
//   google/gemma-4-31b-it:free   — 262K ctx, image+video input
//   google/gemma-4-26b-a4b-it:free — MoE, image+video, lebih kecil/cepat
//   nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free — image+audio+video
// Ganti via env OPENROUTER_MODEL untuk override model pertama.
const VISION_MODELS_FREE = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
]

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Cooldown per model — 2 menit setelah 429/503 sebelum mencoba ulang model yang sama
const modelCooldown = new Map<string, number>()
const COOLDOWN_MS = 120_000

function isOnCooldown(model: string): boolean {
  const last = modelCooldown.get(model)
  return !!last && Date.now() - last < COOLDOWN_MS
}

function setCooldown(model: string): void {
  modelCooldown.set(model, Date.now())
}

function getModels(): string[] {
  const envModel = process.env.OPENROUTER_MODEL
  if (envModel) return [envModel, ...VISION_MODELS_FREE.filter((m) => m !== envModel)]
  return VISION_MODELS_FREE
}

// Ambil JSON dari respons, buang pembungkus markdown ```json jika ada.
function extractJson(text: string): string {
  let t = text.trim()
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  }
  const first = t.indexOf('{')
  const last = t.lastIndexOf('}')
  if (first !== -1 && last !== -1) {
    t = t.slice(first, last + 1)
  }
  return t.trim()
}

// Coba tiap model secara berurutan. Jika model rate-limited (429/503), lanjut ke berikutnya.
async function callOpenRouter(messages: object[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY tidak ditemukan')

  const models = getModels()
  const errors: string[] = []

  for (const model of models) {
    if (isOnCooldown(model)) {
      console.warn(`[openrouter] Skipping ${model} (cooldown aktif)`)
      errors.push(`[${model}] cooldown — skip`)
      continue
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Header opsional untuk ranking di openrouter.ai/rankings
        'HTTP-Referer': 'https://github.com/crypto-chart-analyst',
        'X-Title': 'Crypto Chart Analyst',
      },
      body: JSON.stringify({
        model,
        messages,
        // Catatan: response_format tidak didukung semua model free tier.
        // JSON diminta via prompt, parsing dilakukan manual di extractJson().
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      const errMsg = `[${model}] ${response.status}: ${err}`
      console.warn('[openrouter] Model gagal:', errMsg)
      errors.push(errMsg)
      // 429 (rate limit) atau 503/502 (unavailable) → set cooldown, coba model berikutnya
      if (response.status === 429 || response.status >= 500) {
        setCooldown(model)
      }
      continue
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      errors.push(`[${model}] Tidak mengembalikan konten`)
      continue
    }
    return content as string
  }

  throw new Error(`Semua OpenRouter model gagal: ${errors.join(' | ')}`)
}

export async function analyzeWithOpenRouter(
  imageBase64: string,
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp',
  timeframe?: string
): Promise<AnalysisResult> {
  const text = await callOpenRouter([
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${imageBase64}` },
        },
        {
          type: 'text',
          text: buildSingleChartPrompt(timeframe),
        },
      ],
    },
  ])

  const parsed = JSON.parse(extractJson(text))

  if (parsed.error) {
    throw new Error(parsed.error)
  }

  parsed.overlay = normalizeOverlay(parsed.overlay ?? null)
  parsed.engine_used = 'openrouter-vision'

  return validateConsistency(parsed as AnalysisResult)
}

export async function synthesizeMtfWithOpenRouter(
  results: Partial<Record<string, AnalysisResult>>
): Promise<MtfSynthesis> {
  const text = await callOpenRouter([
    {
      role: 'user',
      content: buildMtfSynthesisPrompt(results),
    },
  ])

  return JSON.parse(extractJson(text)) as MtfSynthesis
}
