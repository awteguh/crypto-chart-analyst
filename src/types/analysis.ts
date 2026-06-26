// src/types/analysis.ts

export interface Pattern {
  name: string
  confidence: number // 0-100
  bias: 'Bullish' | 'Bearish' | 'Neutral'
  location: 'recent' | 'historical'
}

// Titik koordinat dalam persen (0-100) relatif terhadap ukuran gambar chart.
// x: 0 = kiri, 100 = kanan. y: 0 = atas, 100 = bawah.
export interface Point {
  x: number
  y: number
}

// Garis pattern (trendline) yang membentuk pola seperti Double Top,
// Head & Shoulders, Triangle, Wedge, dll. Digambar sebagai polyline.
export interface PatternLine {
  label: string // nama garis, mis. "Neckline", "Upper Trendline"
  points: Point[] // urutan titik membentuk garis
  bias: 'Bullish' | 'Bearish' | 'Neutral'
}

// Garis horizontal level harga (Entry / TP / SL / Support / Resistance).
export interface PriceLevel {
  type: 'Entry' | 'TakeProfit' | 'StopLoss' | 'Support' | 'Resistance'
  y: number // posisi vertikal dalam persen (0-100)
  label: string // teks label, mis. "Entry", "TP 24550"
}

// Panah arah prediksi harga selanjutnya.
export interface DirectionArrow {
  from: Point
  to: Point
  direction: 'up' | 'down'
}

// Semua elemen visual yang digambar di atas gambar chart.
export interface ChartOverlay {
  pattern_lines: PatternLine[]
  price_levels: PriceLevel[]
  arrow: DirectionArrow | null
}

export interface SRLevel {
  type: 'Support' | 'Resistance'
  strength: 'Weak' | 'Moderate' | 'Strong'
  description: string
}

export interface TradeSignal {
  entry: string
  stop_loss: string
  take_profit: string
  risk_reward: string // e.g. "1:2.5"
}

export interface AnalysisResult {
  timeframe: string
  trend: 'Bullish' | 'Bearish' | 'Sideways'
  patterns: Pattern[]
  support_resistance: SRLevel[]
  indicators_detected: string[]
  signal: TradeSignal
  pump_probability: number // 0-100
  dump_probability: number // 0-100
  next_candle_bias: 'PUMP' | 'DUMP' | 'NEUTRAL'
  summary: string
  engine_used: 'claude-vision' | 'gemini-vision' | 'openrouter-vision' | 'rule-based'
  overlay: ChartOverlay | null // koordinat garis pattern untuk digambar di atas chart
}

export interface MtfSynthesis {
  overall_trend: 'Bullish' | 'Bearish' | 'Sideways'
  confidence: 'Low' | 'Medium' | 'High'
  pump_probability: number
  dump_probability: number
  next_candle_bias: 'PUMP' | 'DUMP' | 'NEUTRAL'
  confluences: string[]
  conflicts: string[]
  summary: string
  recommended_signal: TradeSignal
}

export interface MtfAnalysisResponse {
  results: {
    '15m'?: AnalysisResult
    '1h'?: AnalysisResult
    '4h'?: AnalysisResult
    '1D'?: AnalysisResult
  }
  synthesis: MtfSynthesis
}
