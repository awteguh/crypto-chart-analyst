// src/lib/engines/analyzer.ts

import type { AnalysisResult } from '@/types/analysis'
import { analyzeWithClaude } from './claude-vision'
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

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[analyzer] ANTHROPIC_API_KEY tidak ada, menggunakan rule-based fallback')
    return analyzeWithRuleBased(buffer, timeframe)
  }

  try {
    const result = await analyzeWithClaude(base64, mimeType, timeframe)
    return result
  } catch (err) {
    console.warn('[analyzer] Claude Vision gagal, fallback ke rule-based:', err)
    return analyzeWithRuleBased(buffer, timeframe)
  }
}
