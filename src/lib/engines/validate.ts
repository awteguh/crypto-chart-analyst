// src/lib/engines/validate.ts
//
// Post-processing: pastikan AnalysisResult yang dikembalikan AI konsisten secara logika.
// AI kadang melaporkan pattern bearish tapi memberi pump_probability lebih tinggi,
// atau next_candle_bias bertentangan dengan probabilitas. Fungsi ini memperbaikinya.

import type { AnalysisResult, ChartOverlay } from '@/types/analysis'

/**
 * Normalisasi overlay dari AI:
 * - arrow.direction harus 'up' atau 'down' — jika tidak, hapus arrow
 * - chart_bounds harus valid (0-100, x1<x2, y1<y2) — jika tidak, set null
 */
export function normalizeOverlay(overlay: ChartOverlay | null): ChartOverlay | null {
  if (!overlay) return null

  // Normalize arrow
  const arrow = overlay.arrow
  const validArrow =
    arrow && (arrow.direction === 'up' || arrow.direction === 'down') ? arrow : null

  // Normalize chart_bounds
  const b = overlay.chart_bounds
  const validBounds =
    b &&
    typeof b.x1 === 'number' && typeof b.y1 === 'number' &&
    typeof b.x2 === 'number' && typeof b.y2 === 'number' &&
    b.x1 < b.x2 && b.y1 < b.y2 &&
    b.x1 >= 0 && b.y1 >= 0 && b.x2 <= 100 && b.y2 <= 100 &&
    (b.x2 - b.x1) >= 10 && (b.y2 - b.y1) >= 10
      ? b
      : null

  return { ...overlay, arrow: validArrow, chart_bounds: validBounds }
}

// Pattern bearish yang kuat (reversal atau continuation bearish)
const BEARISH_PATTERNS = [
  'double top', 'triple top',
  'head and shoulders', 'head & shoulders',
  'rising wedge',
  'bearish flag', 'bear flag',
  'bearish pennant',
  'bearish engulfing',
  'evening star',
  'shooting star',
  'bearish harami',
  'dark cloud cover',
]

// Pattern bullish yang kuat
// CATATAN: entri yang mengandung kata yang juga ada di BEARISH_PATTERNS
// (mis. "head and shoulders") harus punya keyword unik di sini (mis. "inverse")
// agar classifyPattern() yang cek BULLISH duluan bisa menangkap duluan.
const BULLISH_PATTERNS = [
  'double bottom', 'triple bottom',
  'inverse head', 'inverse h&s', 'inverse head and shoulders',
  'falling wedge',
  'bull flag', 'bullish flag',
  'bullish pennant',
  'cup and handle', 'cup & handle',
  'ascending triangle',
  'bullish engulfing',
  'morning star',
  'hammer',
  'bullish harami',
  'piercing line',
]

type Bias = 'bearish' | 'bullish' | 'neutral'

function classifyPattern(name: string): Bias {
  const lower = name.toLowerCase()
  // Cek BULLISH dulu — penting untuk menghindari false-positive:
  // "Inverse Head and Shoulders" mengandung substring "head and shoulders" (bearish),
  // jadi jika bearish dicek duluan akan salah diklasifikasi sebagai bearish.
  // Dengan mengecek bullish dulu, "inverse head" (bullish) dapat prioritas.
  if (BULLISH_PATTERNS.some((p) => lower.includes(p))) return 'bullish'
  if (BEARISH_PATTERNS.some((p) => lower.includes(p))) return 'bearish'
  return 'neutral'
}

/**
 * Validasi dan koreksi konsistensi hasil analisis AI.
 *
 * Logika:
 * 1. Hitung skor bearish vs bullish dari patterns yang terdeteksi.
 *    Pattern "recent" diberi bobot 2x lipat vs "historical".
 * 2. Jika ada dominasi yang jelas (selisih skor > 1), paksa pump/dump dan bias sesuai.
 * 3. Paksa next_candle_bias konsisten dengan pump_probability vs dump_probability.
 * 4. Paksa trend konsisten dengan next_candle_bias (jika bias kuat).
 */
export function validateConsistency(result: AnalysisResult): AnalysisResult {
  const { patterns } = result

  if (patterns.length === 0) {
    // Tidak ada pattern — hanya pastikan next_candle_bias konsisten dengan probabilitas
    return fixBiasFromProb(result)
  }

  let bearishScore = 0
  let bullishScore = 0

  for (const p of patterns) {
    const weight = p.location === 'recent' ? 2 : 1
    const bias = classifyPattern(p.name)
    if (bias === 'bearish') bearishScore += weight * (p.confidence / 100)
    if (bias === 'bullish') bullishScore += weight * (p.confidence / 100)
  }

  const totalScore = bearishScore + bullishScore
  if (totalScore < 0.3) {
    // Skor terlalu rendah / pattern neutral semua — tidak koreksi probabilitas
    return fixBiasFromProb(result)
  }

  const bearishRatio = bearishScore / totalScore // 0-1
  const bullishRatio = bullishScore / totalScore

  // Hanya koreksi jika dominasi cukup jelas (selisih > 20%)
  const dominance = Math.abs(bearishRatio - bullishRatio)
  if (dominance < 0.2) {
    return fixBiasFromProb(result)
  }

  let pumpProb = result.pump_probability
  let dumpProb = result.dump_probability

  if (bearishRatio > bullishRatio) {
    // Pattern bearish dominan — dump harus lebih tinggi dari pump
    if (pumpProb >= dumpProb) {
      // AI inkonsisten — koreksi menggunakan skor pattern sebagai bobot
      // Pertahankan "magnitude" AI tapi balik arahnya
      const aiMagnitude = Math.max(pumpProb, dumpProb) // mis. 60
      const minorProb = Math.min(pumpProb, dumpProb)   // mis. 40
      // Balik: yang tadinya pump jadi dump, tapi jangan terlalu ekstrem
      dumpProb = Math.round(aiMagnitude * 0.9 + minorProb * 0.1)
      pumpProb = 100 - dumpProb
      console.info(
        `[validate] Koreksi konsistensi: pattern bearish dominan (score ${bearishScore.toFixed(2)} vs ${bullishScore.toFixed(2)}), ` +
        `pump ${result.pump_probability}→${pumpProb}, dump ${result.dump_probability}→${dumpProb}`
      )
    }
  } else {
    // Pattern bullish dominan — pump harus lebih tinggi dari dump
    if (dumpProb >= pumpProb) {
      const aiMagnitude = Math.max(pumpProb, dumpProb)
      const minorProb = Math.min(pumpProb, dumpProb)
      pumpProb = Math.round(aiMagnitude * 0.9 + minorProb * 0.1)
      dumpProb = 100 - pumpProb
      console.info(
        `[validate] Koreksi konsistensi: pattern bullish dominan (score ${bullishScore.toFixed(2)} vs ${bearishScore.toFixed(2)}), ` +
        `pump ${result.pump_probability}→${pumpProb}, dump ${result.dump_probability}→${dumpProb}`
      )
    }
  }

  const corrected: AnalysisResult = { ...result, pump_probability: pumpProb, dump_probability: dumpProb }
  return fixBiasFromProb(corrected)
}

/** Pastikan next_candle_bias konsisten dengan pump vs dump probability. */
function fixBiasFromProb(result: AnalysisResult): AnalysisResult {
  const { pump_probability, dump_probability } = result
  const diff = pump_probability - dump_probability

  let next_candle_bias = result.next_candle_bias
  if (diff > 10 && next_candle_bias !== 'PUMP') {
    console.info(`[validate] Koreksi next_candle_bias: ${next_candle_bias} → PUMP (pump=${pump_probability})`)
    next_candle_bias = 'PUMP'
  } else if (diff < -10 && next_candle_bias !== 'DUMP') {
    console.info(`[validate] Koreksi next_candle_bias: ${next_candle_bias} → DUMP (dump=${dump_probability})`)
    next_candle_bias = 'DUMP'
  } else if (Math.abs(diff) <= 10 && next_candle_bias !== 'NEUTRAL') {
    console.info(`[validate] Koreksi next_candle_bias: ${next_candle_bias} → NEUTRAL (selisih=${diff})`)
    next_candle_bias = 'NEUTRAL'
  }

  return { ...result, next_candle_bias }
}
