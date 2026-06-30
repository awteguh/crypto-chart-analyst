// src/lib/prompts/mtf-chart.ts

import type { AnalysisResult } from '@/types/analysis'

function formatIndicators(r: AnalysisResult): string {
  const ind = r.indicator_readings
  if (!ind) return '  Indikator: tidak tersedia'

  const lines: string[] = []

  if (ind.rsi) {
    const div = ind.rsi.divergence ? ` | Divergence: ${ind.rsi.divergence}` : ''
    lines.push(`  RSI: ${ind.rsi.value ?? '?'} (${ind.rsi.zone})${div}`)
  }
  if (ind.macd) {
    lines.push(`  MACD: ${ind.macd.signal} | Histogram: ${ind.macd.histogram} | Line: ${ind.macd.macd_line}`)
  }
  if (ind.bollinger) {
    const sq = ind.bollinger.squeeze ? ' [SQUEEZE]' : ''
    lines.push(`  Bollinger: ${ind.bollinger.zone}${sq}`)
  }
  if (ind.volume) {
    const conf = ind.volume.confirms_price ? 'confirm' : 'diverge'
    lines.push(`  Volume: ${ind.volume.trend} (${conf})`)
  }
  if (ind.stochastic) {
    lines.push(`  Stochastic: %K=${ind.stochastic.k_value ?? '?'} (${ind.stochastic.zone}) | ${ind.stochastic.signal}`)
  }
  if (ind.ema && ind.ema.length > 0) {
    const emaStr = ind.ema.map(e => `EMA${e.period}: ${e.relation}`).join(', ')
    lines.push(`  EMA: ${emaStr}`)
  }

  return lines.length > 0 ? lines.join('\n') : '  Indikator: tidak tersedia'
}

function formatTimeframe(tf: string, r: AnalysisResult): string {
  const patterns = r.patterns.length > 0
    ? r.patterns.map(p => `${p.name} (${p.bias}, ${p.location}, ${p.confidence}%)`).join(', ')
    : 'Tidak ada pattern'

  return `
━━━ ${tf} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Trend   : ${r.trend}
  Bias    : ${r.next_candle_bias}
  Pump    : ${r.pump_probability}% | Dump: ${r.dump_probability}%
  Pattern : ${patterns}
${formatIndicators(r)}
  Summary : ${r.summary}`
}

export function buildMtfSynthesisPrompt(
  results: Partial<Record<string, AnalysisResult>>
): string {
  const entries = Object.entries(results).filter(([, r]) => r != null) as [string, AnalysisResult][]
  const tfBlock = entries.map(([tf, r]) => formatTimeframe(tf, r)).join('\n')

  return `Kamu adalah analis teknikal crypto senior tier-1 yang ahli membaca konfluensi multi-timeframe.

Berikut adalah hasil analisis LENGKAP per timeframe, termasuk semua indikator teknikal:
${tfBlock}

═══════════════════════════════════════════════════════════════
METODOLOGI SINTESIS MTF
═══════════════════════════════════════════════════════════════

LANGKAH 1 — BOBOT TIMEFRAME
Timeframe BESAR memiliki bobot LEBIH TINGGI:
  1D  = bobot 4x | 4H = bobot 3x | 1H = bobot 2x | 15M = bobot 1x | 5M = bobot 0.5x

LANGKAH 2 — HITUNG SKOR PUMP vs DUMP
Untuk setiap TF, kontribusi berbobot:
  pump_weighted[TF] = pump_probability[TF] × bobot[TF]
  dump_weighted[TF] = dump_probability[TF] × bobot[TF]

Skor bonus dari konfluensi indikator (tambahkan ke raw score):
  Semua TF agree arah yang sama          → +10 ke arah itu
  RSI Divergence di salah satu TF        → +8 ke arah reversal
  MACD Crossover di 1D atau 4H           → +12 ke arah crossover
  RSI Extreme (<20 atau >80) di 2+ TF   → +10 ke arah yang sesuai
  Pattern major di 1D (H&S, Double Top/Bottom, Wedge) → +10 ke arah pattern
  Bollinger Squeeze di 4H atau 1D        → tidak ada bonus (tunggu breakout)
  Volume spike confirm di TF besar       → +5 ke arah yang dikonfirmasi

Formula akhir:
  total_bobot = jumlah semua bobot TF yang ada
  raw_pump = (sum pump_weighted / total_bobot) + bonus_pump - bonus_dump
  pump_probability = max(10, min(90, round(raw_pump)))
  dump_probability = 100 - pump_probability

LANGKAH 3 — IDENTIFIKASI KONFLUENSI & KONFLIK
Konfluensi (faktor yang SAMA arahnya di 2+ TF):
  Contoh: "RSI Oversold di 1H dan 4H", "MACD Bullish Crossover di 4H dan 1D"

Konflik (faktor yang BERTENTANGAN antar TF):
  Contoh: "15M DUMP tapi 4H dan 1D PUMP → koreksi sementara dalam tren naik"
  Contoh: "RSI Overbought di 1D meski semua TF kecil masih bullish → risiko reversal"

LANGKAH 4 — RECOMMENDED SIGNAL
  Entry: Berdasarkan TF terkecil yang align dengan tren TF besar
  Stop Loss: Di bawah support TF medium (1H atau 4H)
  Take Profit: Target resistance TF besar atau Upper Bollinger 4H/1D
  R:R: Hitung dari jarak entry-SL vs entry-TP

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
    "RSI Oversold (<30) di 1H dan 4H — tekanan beli dari dua TF",
    "MACD Bullish Crossover di 4H — momentum bullish mendominasi"
  ],
  "conflicts": [
    "15M masih bearish bias — entry dini berisiko, tunggu konfirmasi"
  ],
  "summary": "Ringkasan 3-4 kalimat Bahasa Indonesia yang WAJIB menyebut: (1) indikator dominan yang menentukan bias (sebut nama & nilai konkret), (2) konfluensi antar TF, (3) risiko konflik jika ada, (4) rekomendasi tindakan",
  "recommended_signal": {
    "entry": "Contoh: Entry buy di break resistance 42.500 setelah 15M MACD bullish crossover",
    "stop_loss": "Contoh: SL di bawah EMA 50 (4H) atau support 40.000",
    "take_profit": "Contoh: TP1 45.000 (resistance 4H), TP2 48.500 (Upper BB 1D)",
    "risk_reward": "1:2.5"
  }
}

VALIDASI WAJIB:
✓ pump_probability + dump_probability = 100
✓ next_candle_bias: gap > 10 → PUMP/DUMP, ≤ 10 → NEUTRAL
✓ overall_trend: Bullish jika pump > 60, Bearish jika dump > 60, Sideways 40-60
✓ confidence: High jika TF bobot ≥ 75% agree, Medium jika 50-74%, Low jika < 50%
✓ summary WAJIB sebut minimal 2 indikator konkret (nama + nilai/status)
✓ confluences dan conflicts harus diisi sesuai data yang ada (bukan array kosong jika ada 2+ TF)
`
}
