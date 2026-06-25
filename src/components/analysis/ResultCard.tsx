// src/components/analysis/ResultCard.tsx

import type { AnalysisResult } from '@/types/analysis'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PatternBadge } from './PatternBadge'
import { PumpDumpMeter } from './PumpDumpMeter'
import { SupportResistance } from './SupportResistance'
import { SignalSummary } from './SignalSummary'

interface ResultCardProps {
  result: AnalysisResult
  imageUrl?: string
}

export function ResultCard({ result, imageUrl }: ResultCardProps) {
  const trendVariant =
    result.trend === 'Bullish' ? 'bullish' : result.trend === 'Bearish' ? 'bearish' : 'neutral'

  return (
    <Card className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-700 dark:text-gray-200">
            {result.timeframe !== 'unknown' ? `Chart ${result.timeframe}` : 'Chart'}
          </span>
          <Badge variant={trendVariant}>{result.trend}</Badge>
        </div>
        {result.engine_used === 'rule-based' && (
          <Badge variant="neutral">⚠️ Fallback</Badge>
        )}
      </div>

      {/* Preview gambar */}
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="Chart" className="w-full rounded-lg object-cover max-h-48" />
      )}

      {/* Pump/Dump Meter */}
      <PumpDumpMeter
        pumpProbability={result.pump_probability}
        dumpProbability={result.dump_probability}
        bias={result.next_candle_bias}
      />

      {/* Patterns */}
      {result.patterns.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
            Pattern Terdeteksi
          </h4>
          <div className="flex flex-wrap gap-1">
            {result.patterns.map((p, i) => (
              <PatternBadge key={i} pattern={p} />
            ))}
          </div>
        </div>
      )}

      {/* Indicators */}
      {result.indicators_detected.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
            Indikator
          </h4>
          <div className="flex flex-wrap gap-1">
            {result.indicators_detected.map((ind, i) => (
              <Badge key={i} variant="info">{ind}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Support/Resistance */}
      <SupportResistance levels={result.support_resistance} />

      {/* Signal */}
      <SignalSummary signal={result.signal} />

      {/* Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
        <span className="font-semibold">📝 Analisis AI: </span>
        {result.summary}
      </div>
    </Card>
  )
}
