// src/types/chart.ts

export type Timeframe = '15m' | '1h' | '4h' | '1D'

export const TIMEFRAMES: Timeframe[] = ['15m', '1h', '4h', '1D']

export interface ChartUpload {
  file: File
  timeframe: Timeframe
  preview: string // base64 data URL for preview
}
