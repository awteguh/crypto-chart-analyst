// src/lib/engines/analyzer.ts

import sharp from 'sharp'
import type { AnalysisResult } from '@/types/analysis'
import type { CropBox } from '@/types/crop'
import { isMeaningfulCrop } from '@/types/crop'
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

/**
 * Crop buffer gambar ke area tertentu (koordinat dalam persen 0-100).
 * Output selalu PNG agar konsisten.
 */
async function cropBuffer(buffer: Buffer, box: CropBox): Promise<Buffer> {
  const meta = await sharp(buffer).metadata()
  const imgW = meta.width ?? 0
  const imgH = meta.height ?? 0
  if (!imgW || !imgH) return buffer

  const left   = Math.round(box.x1 / 100 * imgW)
  const top    = Math.round(box.y1 / 100 * imgH)
  const width  = Math.round((box.x2 - box.x1) / 100 * imgW)
  const height = Math.round((box.y2 - box.y1) / 100 * imgH)

  // Guard: pastikan extract area tidak melebihi batas gambar
  const safeWidth  = Math.min(width,  imgW - left)
  const safeHeight = Math.min(height, imgH - top)
  if (safeWidth <= 0 || safeHeight <= 0) return buffer

  return sharp(buffer)
    .extract({ left, top, width: safeWidth, height: safeHeight })
    .png()
    .toBuffer()
}

export async function analyzeChart(
  file: File,
  timeframe?: string,
  cropBox?: CropBox | null
): Promise<AnalysisResult> {
  const mimeType = getMimeType(file)
  let buffer: Buffer = Buffer.from(await file.arrayBuffer()) as Buffer
  let effectiveMime: SupportedMime = mimeType

  // Crop gambar sebelum analisis jika cropBox valid
  if (cropBox && isMeaningfulCrop(cropBox)) {
    buffer = await cropBuffer(buffer, cropBox)
    effectiveMime = 'image/png' // cropBuffer selalu output PNG
    console.info(`[analyzer] Crop applied: x1=${cropBox.x1} y1=${cropBox.y1} x2=${cropBox.x2} y2=${cropBox.y2}`)
  }

  const base64 = buffer.toString('base64')
  const engineErrors: string[] = []

  if (process.env.GEMINI_API_KEY) {
    try {
      return await analyzeWithGemini(base64, effectiveMime, timeframe)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[analyzer] Gemini Vision gagal:', msg)
      engineErrors.push(`Gemini: ${msg}`)
    }
  }

  if (process.env.OPENROUTER_API_KEY) {
    try {
      return await analyzeWithOpenRouter(base64, effectiveMime, timeframe)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[analyzer] OpenRouter Vision gagal:', msg)
      engineErrors.push(`OpenRouter: ${msg}`)
    }
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await analyzeWithClaude(base64, effectiveMime, timeframe)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[analyzer] Claude Vision gagal:', msg)
      engineErrors.push(`Claude: ${msg}`)
    }
  }

  console.warn('[analyzer] Semua engine gagal, fallback rule-based. Errors:', engineErrors)
  const result = await analyzeWithRuleBased(buffer, timeframe)
  if (engineErrors.length > 0) {
    result.summary = `[Fallback rule-based] Engine AI gagal — ${engineErrors.join(' | ')}. Periksa console server untuk detail.`
  }
  return result
}
