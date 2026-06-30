// src/lib/engines/rule-based.ts

import sharp from 'sharp'
import type { AnalysisResult, MtfSynthesis } from '@/types/analysis'

/**
 * Analisis histogram warna gambar chart.
 * Hitung rasio pixel merah vs hijau untuk estimasi pump/dump.
 */
export async function analyzeWithRuleBased(
  imageBuffer: Buffer,
  timeframe?: string
): Promise<AnalysisResult> {
  const { data, info } = await sharp(imageBuffer)
    .resize(200, 200) // resize untuk efisiensi
    .raw()
    .toBuffer({ resolveWithObject: true })

  let redPixels = 0
  let greenPixels = 0
  const channels = info.channels // 3 (RGB) atau 4 (RGBA)

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Candle merah: R dominan, G rendah
    if (r > 150 && g < 100 && b < 100) redPixels++
    // Candle hijau: G dominan, R rendah
    if (g > 150 && r < 100 && b < 100) greenPixels++
  }

  const total = redPixels + greenPixels || 1
  const greenRatio = greenPixels / total
  const pumpProb = Math.round(greenRatio * 100)
  const dumpProb = 100 - pumpProb

  const trend =
    pumpProb > 60 ? 'Bullish' : pumpProb < 40 ? 'Bearish' : 'Sideways'

  const bias: 'PUMP' | 'DUMP' | 'NEUTRAL' =
    pumpProb > 60 ? 'PUMP' : pumpProb < 40 ? 'DUMP' : 'NEUTRAL'

  return {
    timeframe: timeframe || 'unknown',
    trend,
    patterns: [],
    support_resistance: [],
    indicators_detected: [],
    indicator_readings: null,
    signal: {
      entry: 'Analisis terbatas — gunakan Claude Vision untuk sinyal akurat',
      stop_loss: '-',
      take_profit: '-',
      risk_reward: '-',
    },
    pump_probability: pumpProb,
    dump_probability: dumpProb,
    next_candle_bias: bias,
    summary:
      'Analisis rule-based (fallback): berdasarkan estimasi warna candle. Akurasi terbatas. Pastikan GEMINI_API_KEY atau OPENROUTER_API_KEY valid di .env.local, lalu restart server.',
    engine_used: 'rule-based',
    overlay: null, // rule-based tidak bisa menghasilkan koordinat pattern
  }
}

export function synthesizeMtfRuleBased(
  results: Partial<Record<string, AnalysisResult>>
): MtfSynthesis {
  const values = Object.values(results).filter(Boolean) as AnalysisResult[]
  const avgPump =
    values.length > 0
      ? Math.round(values.reduce((sum, r) => sum + r.pump_probability, 0) / values.length)
      : 50
  const avgDump = 100 - avgPump

  const bias: 'PUMP' | 'DUMP' | 'NEUTRAL' =
    avgPump > 60 ? 'PUMP' : avgPump < 40 ? 'DUMP' : 'NEUTRAL'

  const bullishCount = values.filter((r) => r.trend === 'Bullish').length
  const bearishCount = values.filter((r) => r.trend === 'Bearish').length

  return {
    overall_trend:
      bullishCount > bearishCount
        ? 'Bullish'
        : bearishCount > bullishCount
        ? 'Bearish'
        : 'Sideways',
    confidence: 'Low',
    pump_probability: avgPump,
    dump_probability: avgDump,
    next_candle_bias: bias,
    confluences: [],
    conflicts: [],
    summary: 'Synthesis rule-based (fallback). Akurasi terbatas.',
    recommended_signal: {
      entry: '-',
      stop_loss: '-',
      take_profit: '-',
      risk_reward: '-',
    },
  }
}
