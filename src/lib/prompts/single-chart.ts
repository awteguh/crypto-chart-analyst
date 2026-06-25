// src/lib/prompts/single-chart.ts

export function buildSingleChartPrompt(timeframe?: string): string {
  const tfLabel = timeframe ? `Timeframe: ${timeframe}.` : ''
  return `Kamu adalah analis teknikal crypto profesional. ${tfLabel}

Analisis screenshot chart crypto ini secara mendetail dan kembalikan HANYA JSON valid (tanpa markdown, tanpa penjelasan tambahan) dengan format berikut:

{
  "timeframe": "${timeframe || 'unknown'}",
  "trend": "Bullish" | "Bearish" | "Sideways",
  "patterns": [
    {
      "name": "nama pattern candlestick dalam Bahasa Inggris",
      "confidence": 85,
      "bias": "Bullish" | "Bearish" | "Neutral",
      "location": "recent" | "historical"
    }
  ],
  "support_resistance": [
    {
      "type": "Support" | "Resistance",
      "strength": "Weak" | "Moderate" | "Strong",
      "description": "deskripsi singkat lokasi level"
    }
  ],
  "indicators_detected": ["RSI oversold", "MACD bullish crossover"],
  "signal": {
    "entry": "deskripsi area entry",
    "stop_loss": "deskripsi area stop loss",
    "take_profit": "deskripsi area take profit",
    "risk_reward": "1:2.5"
  },
  "pump_probability": 72,
  "dump_probability": 28,
  "next_candle_bias": "PUMP" | "DUMP" | "NEUTRAL",
  "summary": "Ringkasan analisis dalam 2-3 kalimat Bahasa Indonesia",
  "engine_used": "claude-vision"
}

Perhatikan:
- patterns bisa array kosong [] jika tidak ada pattern signifikan
- pump_probability + dump_probability harus = 100
- Deteksi semua pattern candlestick yang terlihat: Doji, Hammer, Shooting Star, Engulfing, Harami, Morning/Evening Star, dll
- Jika chart tidak dapat dikenali sebagai chart crypto/trading, kembalikan error: {"error": "Gambar tidak dikenali sebagai chart crypto"}
`
}
