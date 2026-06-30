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

// Batas area chart candlestick dalam gambar (dalam persen 0-100).
// Diperlukan jika gambar punya UI tambahan (header, tombol, watermark, dll)
// sehingga area chart tidak mengisi seluruh gambar.
// Contoh Stockbit: area chart mulai ~y=25% dan berakhir ~y=72%.
export interface ChartBounds {
  x1: number // tepi kiri area chart (biasanya ~0-5)
  y1: number // tepi atas area chart (mis. 25 jika ada header)
  x2: number // tepi kanan area chart (biasanya ~95-100)
  y2: number // tepi bawah area chart (mis. 72 jika ada tombol di bawah)
}

// Semua elemen visual yang digambar di atas gambar chart.
export interface ChartOverlay {
  pattern_lines: PatternLine[]
  price_levels: PriceLevel[]
  arrow: DirectionArrow | null
  chart_bounds?: ChartBounds | null // null = chart mengisi seluruh gambar
}

export interface SRLevel {
  type: 'Support' | 'Resistance'
  strength: 'Weak' | 'Moderate' | 'Strong'
  description: string
}

// ──────────────────────────────────────────────────────────────────────────────
// Structured indicator readings — nilai nyata yang dibaca AI dari chart image
// ──────────────────────────────────────────────────────────────────────────────

export type MacdSignal = 'Bullish Crossover' | 'Bearish Crossover' | 'Bullish' | 'Bearish' | 'Neutral'
export type RsiZone   = 'Overbought' | 'Oversold' | 'Neutral'
export type BbZone    = 'Above Upper Band' | 'Near Upper Band' | 'Mid Band' | 'Near Lower Band' | 'Below Lower Band'

export interface RsiReading {
  value: number | null         // angka RSI 0-100, null jika tidak terdeteksi
  zone: RsiZone
  divergence: 'Bullish' | 'Bearish' | null
}

export interface MacdReading {
  signal: MacdSignal
  histogram: 'Positive' | 'Negative' | 'Zero'
  macd_line: 'Above Signal' | 'Below Signal' | 'Crossing'
}

export interface BollingerReading {
  zone: BbZone
  squeeze: boolean             // true = band menyempit (volatilitas rendah)
}

export interface VolumeReading {
  trend: 'Increasing' | 'Decreasing' | 'Spike' | 'Low' | 'Normal'
  confirms_price: boolean      // true = volume confirm pergerakan harga
}

export interface EmaReading {
  period: number               // mis. 20, 50, 200
  relation: 'Price Above' | 'Price Below' | 'Price Crossing'
}

export interface StochasticReading {
  k_value: number | null
  zone: 'Oversold' | 'Overbought' | 'Neutral'
  signal: 'Bullish Crossover' | 'Bearish Crossover' | 'Bullish' | 'Bearish' | 'Neutral'
}

export interface IndicatorReadings {
  rsi:        RsiReading | null
  macd:       MacdReading | null
  bollinger:  BollingerReading | null
  volume:     VolumeReading | null
  ema:        EmaReading[]
  stochastic: StochasticReading | null
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
  indicator_readings: IndicatorReadings | null // nilai terstruktur dari setiap indikator
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
