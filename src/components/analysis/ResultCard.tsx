// src/components/analysis/ResultCard.tsx

import type { AnalysisResult } from '@/types/analysis'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PatternBadge } from './PatternBadge'
import { PumpDumpMeter } from './PumpDumpMeter'
import { SupportResistance } from './SupportResistance'
import { SignalSummary } from './SignalSummary'
import { ChartOverlayView } from './ChartOverlay'
import { PatternReference } from './PatternReference'

interface ResultCardProps {
  result: AnalysisResult
  imageUrl?: string
}

function Divider() {
  return <div className="border-t border-white/[0.05] my-3" />
}

export function ResultCard({ result, imageUrl }: ResultCardProps) {
  const trendVariant =
    result.trend === 'Bullish' ? 'bullish' : result.trend === 'Bearish' ? 'bearish' : 'neutral'

  const engineLabel =
    result.engine_used === 'gemini-vision'
      ? '✦ Gemini AI'
      : result.engine_used === 'openrouter-vision'
      ? '✦ OpenRouter AI'
      : result.engine_used === 'claude-vision'
      ? '✦ Claude AI'
      : '⚠️ Fallback'

  return (
    <Card className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#e2e8f0]">
            {result.timeframe !== 'unknown' ? `Chart ${result.timeframe}` : 'Chart'}
          </span>
          <Badge variant={trendVariant}>{result.trend}</Badge>
        </div>
        <Badge variant={result.engine_used === 'rule-based' ? 'neutral' : 'info'}>
          {engineLabel}
        </Badge>
      </div>

      {/* Preview gambar */}
      {imageUrl &&
        (result.overlay ? (
          <ChartOverlayView imageUrl={imageUrl} overlay={result.overlay} alt={`Chart ${result.timeframe}`} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Chart" className="w-full rounded-xl object-cover max-h-48" />
        ))}

      {/* Pump/Dump Meter */}
      <PumpDumpMeter
        pumpProbability={result.pump_probability}
        dumpProbability={result.dump_probability}
        bias={result.next_candle_bias}
      />

      {/* Patterns */}
      {result.patterns.length > 0 && (
        <>
          <Divider />
          <div>
            <h4 className="text-[9px] font-bold tracking-[1.5px] uppercase text-slate-600 mb-2">
              Pattern Terdeteksi
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {result.patterns.map((p, i) => (
                <PatternBadge key={i} pattern={p} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Diagram referensi pattern */}
      <PatternReference patterns={result.patterns} />

      {/* Indicators */}
      {result.indicators_detected.length > 0 && (
        <>
          <Divider />
          <div>
            <h4 className="text-[9px] font-bold tracking-[1.5px] uppercase text-slate-600 mb-2">
              Indikator
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {result.indicators_detected.map((ind, i) => (
                <Badge key={i} variant="info">{ind}</Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Support/Resistance */}
      {result.support_resistance.length > 0 && (
        <>
          <Divider />
          <SupportResistance levels={result.support_resistance} />
        </>
      )}

      {/* Signal */}
      <Divider />
      <SignalSummary signal={result.signal} />

      {/* AI Summary */}
      <div className="bg-cyan-500/[0.05] border border-cyan-500/15 rounded-xl p-3 mt-1">
        <span className="font-semibold text-cyan-400">📝 Analisis AI: </span>
        <span className="text-slate-400 text-sm leading-relaxed">{result.summary}</span>
      </div>
    </Card>
  )
}
