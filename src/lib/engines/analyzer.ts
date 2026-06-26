// src/lib/engines/analyzer.ts

import type { AnalysisResult } from '@/types/analysis'
import { analyzeWithClaude } from './claude-vision'
import { analyzeWithGemini } from './gemini-vision'
import { analyzeWithOpenRouter } from './openrouter-vision'
import { analyzeWithRuleBased } from './rule-based'

type SupportedMime = 'image/png' | 'image/jpeg' | 'image/webp'

const SUPPORTED_TYPES: SupportedMime[] = ['image/png', 'image/jpeg', 'image/webp']

function getMimeType(file: File): SupportedMime {
  const mime = file.type as SupportedMime
  if (!SUPPORTED_TYPES.includes(mime)) {
    throw new Error('Hanya file PNG, JPG, atau WEBP yang didukung')
  }
  return mime
}

export async function analyzeChart(
  file: File,
  timeframe?: string
): Promise<AnalysisResult> {
  const mimeType = getMimeType(file)
  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString('base64')

  const engineErrors: string[] = []

  // Prioritas engine: Gemini (gratis) → OpenRouter → Claude → rule-based (cadangan terakhir)
  if (process.env.GEMINI_API_KEY) {
    try {
      return await analyzeWithGemini(base64, mimeType, timeframe)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[analyzer] Gemini Vision gagal:', msg)
      engineErrors.push(`Gemini: ${msg}`)
    }
  }

  if (process.env.OPENROUTER_API_KEY) {
    try {
      return await analyzeWithOpenRouter(base64, mimeType, timeframe)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[analyzer] OpenRouter Vision gagal:', msg)
      engineErrors.push(`OpenRouter: ${msg}`)
    }
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await analyzeWithClaude(base64, mimeType, timeframe)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[analyzer] Claude Vision gagal:', msg)
      engineErrors.push(`Claude: ${msg}`)
    }
  }

  console.warn('[analyzer] Semua engine gagal, menggunakan rule-based fallback. Errors:', engineErrors)
  const result = await analyzeWithRuleBased(buffer, timeframe)
  // Sertakan error detail di summary supaya bisa didiagnosis dari UI
  if (engineErrors.length > 0) {
    result.summary = `[Fallback rule-based] Engine AI gagal — ${engineErrors.join(' | ')}. Periksa console server untuk detail.`
  }
  return result
}
