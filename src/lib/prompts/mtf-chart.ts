// src/lib/prompts/mtf-chart.ts

import type { AnalysisResult } from '@/types/analysis'

export function buildMtfSynthesisPrompt(results: Partial<Record<string, AnalysisResult>>): string {
  const summary = Object.entries(results)
    .map(([tf, r]) => `${tf}: Trend=${r?.trend}, Bias=${r?.next_candle_bias}, Pump=${r?.pump_probability}%`)
    .join('\n')

  return `Kamu adalah analis teknikal crypto senior. Berikut adalah hasil analisis multi-timeframe:

${summary}

Gabungkan semua analisis di atas dan kembalikan HANYA JSON valid (tanpa markdown) dengan format:

{
  "overall_trend": "Bullish" | "Bearish" | "Sideways",
  "confidence": "Low" | "Medium" | "High",
  "pump_probability": 75,
  "dump_probability": 25,
  "next_candle_bias": "PUMP" | "DUMP" | "NEUTRAL",
  "confluences": ["faktor yang sepakat antar TF, misal: Semua TF bullish"],
  "conflicts": ["faktor yang bertentangan, misal: 15m bearish tapi 1D bullish"],
  "summary": "Ringkasan MTF 3-4 kalimat Bahasa Indonesia",
  "recommended_signal": {
    "entry": "area entry terbaik berdasarkan MTF",
    "stop_loss": "area stop loss",
    "take_profit": "area take profit",
    "risk_reward": "1:2.5"
  }
}

- pump_probability + dump_probability harus = 100
- confidence: High jika 3-4 TF sepakat, Medium jika 2 TF sepakat, Low jika bertentangan
`
}
