// src/types/analysis.ts

export interface Pattern {
  name: string
  confidence: number // 0-100
  bias: 'Bullish' | 'Bearish' | 'Neutral'
  location: 'recent' | 'historical'
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
  engine_used: 'claude-vision' | 'rule-based'
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
