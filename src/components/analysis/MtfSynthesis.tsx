// src/components/analysis/MtfSynthesis.tsx

import type { MtfSynthesis as MtfSynthesisType } from '@/types/analysis'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PumpDumpMeter } from './PumpDumpMeter'
import { SignalSummary } from './SignalSummary'

export function MtfSynthesisPanel({ synthesis }: { synthesis: MtfSynthesisType }) {
  const confidenceVariant =
    synthesis.confidence === 'High'
      ? 'bullish'
      : synthesis.confidence === 'Low'
      ? 'bearish'
      : 'neutral'

  const trendVariant =
    synthesis.overall_trend === 'Bullish'
      ? 'bullish'
      : synthesis.overall_trend === 'Bearish'
      ? 'bearish'
      : 'neutral'

  return (
    <Card className="space-y-4 border-2 border-blue-300 dark:border-blue-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-gray-800 dark:text-white">
          🔭 MTF Synthesis — Overall Bias
        </h3>
        <div className="flex gap-2">
          <Badge variant={trendVariant}>{synthesis.overall_trend}</Badge>
          <Badge variant={confidenceVariant}>{synthesis.confidence} Confidence</Badge>
        </div>
      </div>

      {/* Pump/Dump Meter */}
      <PumpDumpMeter
        pumpProbability={synthesis.pump_probability}
        dumpProbability={synthesis.dump_probability}
        bias={synthesis.next_candle_bias}
      />

      {/* Confluences */}
      {synthesis.confluences.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-green-600 dark:text-green-400 mb-1">
            ✅ Konfluensi (Sepakat)
          </h4>
          <ul className="text-sm space-y-0.5">
            {synthesis.confluences.map((c, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300">• {c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Conflicts */}
      {synthesis.conflicts.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-yellow-600 dark:text-yellow-400 mb-1">
            ⚠️ Konflik (Bertentangan)
          </h4>
          <ul className="text-sm space-y-0.5">
            {synthesis.conflicts.map((c, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300">• {c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Signal */}
      <SignalSummary signal={synthesis.recommended_signal} />

      {/* Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
        <span className="font-semibold">📝 Kesimpulan MTF: </span>
        {synthesis.summary}
      </div>
    </Card>
  )
}
