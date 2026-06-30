// src/lib/prompts/mtf-chart.ts

import type { AnalysisResult } from '@/types/analysis'

// Bobot per timeframe — TF besar lebih dominan
const TF_WEIGHT: Record<string, number> = {
  '1D': 4, '1d': 4,
  '4H': 3, '4h': 3,
  '1H': 2, '1h': 2,
  '15m': 1, '15M': 1,
  '5m': 0.5, '5M': 0.5,
}

function getWeight(tf: string): number {
  return TF_WEIGHT[tf] ?? 1
}

/**
 * Hitung weighted pump/dump probability dari semua TF di JavaScript.
 * Hasilnya dikirim sebagai hint ke AI agar tidak salah hitung.
 */
function calcWeightedProbability(
  entries: [string, AnalysisResult][]
): { weightedPump: number; weightedDump: number; totalWeight: number } {
  let pumpSum = 0
  let dumpSum = 0
  let totalWeight = 0

  for (const [tf, r] of entries) {
    const w = getWeight(tf)
    pumpSum += r.pump_probability * w
    dumpSum += r.dump_probability * w
    totalWeight += w
  }

  if (totalWeight === 0) return { weightedPump: 50, weightedDump: 50, totalWeight: 0 }

  return {
    weightedPump: Math.round(pumpSum / totalWeight),
    weightedDump: Math.round(dumpSum / totalWeight),
    totalWeight,
  }
}

function formatIndicators(r: AnalysisResult): string {
  const ind = r.indicator_readings
  const lines: string[] = []

  // Gunakan indicators_detected (string ringkasan dari AI per-TF) jika tersedia
  if (r.indicators_detected && r.indicators_detected.length > 0) {
    lines.push(`  Indikator Terdeteksi:`)
    r.indicators_detected.forEach(s => lines.push(`    • ${s}`))
  }

  // Tambah structured readings jika ada
  if (ind) {
    if (ind.rsi) {
      const div = ind.rsi.divergence ? ` | Divergence: ${ind.rsi.divergence}` : ''
      lines.push(`  RSI: ${ind.rsi.value ?? '?'} (${ind.rsi.zone})${div}`)
    }
    if (ind.macd) {
      lines.push(`  MACD: ${ind.macd.signal} | Histogram: ${ind.macd.histogram} | Line: ${ind.macd.macd_line}`)
    }
    if (ind.bollinger) {
      const sq = ind.bollinger.squeeze ? ' [SQUEEZE — siap breakout]' : ''
      lines.push(`  Bollinger: ${ind.bollinger.zone}${sq}`)
    }
    if (ind.volume) {
      const conf = ind.volume.confirms_price ? 'confirm' : 'diverge (sinyal lemah)'
      lines.push(`  Volume: ${ind.volume.trend} (${conf})`)
    }
    if (ind.stochastic) {
      lines.push(`  Stochastic: %K=${ind.stochastic.k_value ?? '?'} (${ind.stochastic.zone}) | ${ind.stochastic.signal}`)
    }
    if (ind.ema && ind.ema.length > 0) {
      const emaStr = ind.ema.map(e => `EMA${e.period}: ${e.relation}`).join(', ')
      lines.push(`  EMA: ${emaStr}`)
    }
  }

  return lines.length > 0 ? lines.join('\n') : '  Indikator: tidak tersedia (rule-based fallback)'
}

function formatSR(r: AnalysisResult): string {
  if (!r.support_resistance || r.support_resistance.length === 0) return ''
  const srLines = r.support_resistance
    .map(s => `    ${s.type} (${s.strength}): ${s.description}`)
    .join('\n')
  return `  Support/Resistance:\n${srLines}`
}

function formatSignal(r: AnalysisResult): string {
  const s = r.signal
  if (!s) return ''
  const hasAnySignal = [s.entry, s.stop_loss, s.take_profit].some(v => v && v !== '-')
  if (!hasAnySignal) return ''
  const entry = s.entry && s.entry !== '-' ? s.entry : 'tidak tersedia'
  const sl    = s.stop_loss && s.stop_loss !== '-' ? s.stop_loss : 'tidak tersedia'
  const tp    = s.take_profit && s.take_profit !== '-' ? s.take_profit : 'tidak tersedia'
  return `  Signal: Entry=${entry} | SL=${sl} | TP=${tp} | R:R=${s.risk_reward}`
}

function formatTimeframe(tf: string, r: AnalysisResult, weight: number): string {
  const patterns = r.patterns.length > 0
    ? r.patterns.map(p => `${p.name} (${p.bias}, ${p.location}, ${p.confidence}%)`).join(', ')
    : 'Tidak ada pattern'

  const sr = formatSR(r)
  const signal = formatSignal(r)

  return `
━━━ ${tf} [bobot ${weight}x] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Trend   : ${r.trend}
  Bias    : ${r.next_candle_bias}
  Pump    : ${r.pump_probability}% | Dump: ${r.dump_probability}%
  Pattern : ${patterns}
${formatIndicators(r)}${sr ? '\n' + sr : ''}${signal ? '\n' + signal : ''}
  Summary : ${r.summary}`
}

export function buildMtfSynthesisPrompt(
  results: Partial<Record<string, AnalysisResult>>
): string {
  const entries = Object.entries(results).filter(([, r]) => r != null) as [string, AnalysisResult][]
  const { weightedPump, weightedDump } = calcWeightedProbability(entries)

  const tfBlock = entries
    .sort((a, b) => getWeight(b[0]) - getWeight(a[0])) // urut TF besar dulu
    .map(([tf, r]) => formatTimeframe(tf, r, getWeight(tf)))
    .join('\n')

  return `Kamu adalah analis teknikal crypto senior tier-1 yang ahli konfluensi multi-timeframe.

Berikut data LENGKAP per timeframe (sudah diurutkan dari TF terbesar ke terkecil):
${tfBlock}

═══════════════════════════════════════════════════════════════
DATA PRE-KALKULASI (gunakan sebagai dasar probabilitas)
═══════════════════════════════════════════════════════════════

Weighted pump probability (dihitung dari bobot TF): ${weightedPump}%
Weighted dump probability: ${weightedDump}%

Sesuaikan ±5-15 poin dari nilai di atas berdasarkan:
  +15 PUMP  : RSI Bullish Divergence di 1H atau 4H atau 1D
  +15 DUMP  : RSI Bearish Divergence di 1H atau 4H atau 1D
  +12 PUMP  : MACD Bullish Crossover di 4H atau 1D
  +12 DUMP  : MACD Bearish Crossover di 4H atau 1D
  +10 PUMP  : RSI < 20 di 2+ TF sekaligus
  +10 DUMP  : RSI > 80 di 2+ TF sekaligus
  +8 PUMP   : Semua TF agree PUMP (tanpa konflik)
  +8 DUMP   : Semua TF agree DUMP (tanpa konflik)
  +5 PUMP   : Volume spike confirm bullish di TF besar
  +5 DUMP   : Volume spike confirm bearish di TF besar
  -5        : Bollinger Squeeze (belum bisa tentukan arah)

Klem akhir: min 10, max 90. dump = 100 - pump.

═══════════════════════════════════════════════════════════════
PANDUAN KONFLUENSI & KONFLIK
═══════════════════════════════════════════════════════════════

Konfluensi (sebutkan indikator KONKRET yang sepakat di 2+ TF):
  ✓ "RSI Oversold di 1H (28.4) dan 4H (31.2) — potensi reversal bullish"
  ✓ "MACD Bullish Crossover di 4H dan 1D — momentum bullish kuat"
  ✓ "EMA 50 bertindak sebagai support di 1H dan 4H — area beli valid"

Konflik (sebutkan TF & indikator yang BERTENTANGAN):
  ✗ "15M Bearish (MACD turun, RSI 60) vs 4H Bullish — koreksi jangka pendek"
  ✗ "RSI 1D mendekati Overbought (68) — ruang naik mulai terbatas"
  ✗ "Pattern Bearish (Rising Wedge) di 4H vs Bullish keseluruhan — waspadai breakout bawah"

═══════════════════════════════════════════════════════════════
PANDUAN RECOMMENDED SIGNAL (WAJIB DIISI — JANGAN "-")
═══════════════════════════════════════════════════════════════

Gunakan level Support/Resistance dan Signal dari data per TF di atas.
Entry, Stop Loss, dan Take Profit WAJIB diisi dengan deskripsi konkret.

- Entry    : Sebutkan kondisi masuk + level/area harga jika ada di data
             Contoh: "Buy break di atas resistance 1H, konfirmasi MACD bullish crossover"
             Jika tidak ada harga konkret: "Masuk setelah candle konfirmasi break resistance"
- Stop Loss: Di bawah support terkuat dari 1H atau 4H
             Contoh: "SL di bawah swing low terakhir / support area 1H"
- Take Profit: Resistance berikutnya dari 4H atau 1D
             Contoh: "TP1 di resistance 4H, TP2 di resistance 1D"
- R:R      : Estimasi rasio minimal 1:1.5 (wajib ada angka, bukan "-")

DILARANG mengembalikan "-" untuk entry, stop_loss, atau take_profit.

═══════════════════════════════════════════════════════════════
FORMAT OUTPUT (HANYA JSON VALID, TANPA MARKDOWN)
═══════════════════════════════════════════════════════════════

{
  "overall_trend": "Bullish" | "Bearish" | "Sideways",
  "confidence": "Low" | "Medium" | "High",
  "pump_probability": 72,
  "dump_probability": 28,
  "next_candle_bias": "PUMP" | "DUMP" | "NEUTRAL",
  "confluences": [
    "RSI Oversold (28.4) di 1H dan (31.2) di 4H — potensi reversal ke atas",
    "MACD Bullish Crossover di 4H — histogram positif dan menguat"
  ],
  "conflicts": [
    "15M masih Bearish (RSI 58, MACD turun) — hindari entry terlalu dini",
    "RSI 1D mendekati 65 — ruang naik mulai terbatas"
  ],
  "summary": "Ringkasan 3-4 kalimat WAJIB menyebut: (1) indikator konkret yang dominan dengan nilai/status-nya, (2) konfluensi antar TF, (3) konflik atau risiko jika ada, (4) rekomendasi tindakan yang jelas",
  "recommended_signal": {
    "entry": "Entry buy di break 42.500 (resistance 4H) dengan konfirmasi 15M MACD bullish crossover",
    "stop_loss": "SL di bawah EMA 50 (4H) di area 40.000",
    "take_profit": "TP1 45.000 (resistance 1D), TP2 48.500 (Upper BB 1D)",
    "risk_reward": "1:2.5"
  }
}

VALIDASI WAJIB SEBELUM OUTPUT:
✓ pump_probability + dump_probability = 100
✓ pump_probability harus dekat ${weightedPump}% (±15 poin dari bonus/penalti di atas)
✓ next_candle_bias: gap > 10 → PUMP/DUMP, ≤ 10 → NEUTRAL
✓ overall_trend: Bullish jika pump > 60, Bearish jika dump > 60, Sideways 40-60
✓ confidence: High jika TF bobot ≥ 75% agree, Medium jika 50-74%, Low jika < 50%
✓ confluences & conflicts WAJIB menyebut nama indikator dan nilai konkret (bukan generik)
✓ summary WAJIB sebut minimal 2 indikator dengan nilai nyata
✓ recommended_signal entry/SL/TP harus konkret (level atau EMA/BB yang disebutkan dalam data)
`
}
