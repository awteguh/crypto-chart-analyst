// src/components/analysis/MtfSynthesis.tsx

import type { MtfSynthesis as MtfSynthesisType } from '@/types/analysis'
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
    <div className="space-y-4 rounded-2xl border-2 border-cyan-500/20 bg-white/[0.03] backdrop-blur-xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-slate-200 tracking-tight">
          MTF Synthesis — Overall Bias
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
          <h4 className="text-[9px] font-bold tracking-[1.5px] uppercase text-emerald-500/80 mb-2">
            Konfluensi (Sepakat)
          </h4>
          <ul className="space-y-1">
            {synthesis.confluences.map((c, i) => (
              <li key={i} className="text-xs text-slate-400 flex gap-2">
                <span className="text-emerald-500 shrink-0">▸</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Conflicts */}
      {synthesis.conflicts.length > 0 && (
        <div>
          <h4 className="text-[9px] font-bold tracking-[1.5px] uppercase text-amber-500/80 mb-2">
            Konflik (Bertentangan)
          </h4>
          <ul className="space-y-1">
            {synthesis.conflicts.map((c, i) => (
              <li key={i} className="text-xs text-slate-400 flex gap-2">
                <span className="text-amber-500 shrink-0">⚠</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Signal */}
      <SignalSummary signal={synthesis.recommended_signal} />

      {/* Summary */}
      <div className="bg-cyan-500/[0.05] border border-cyan-500/15 rounded-xl p-3">
        <span className="font-semibold text-cyan-400 text-xs">Kesimpulan MTF: </span>
        <span className="text-slate-400 text-xs leading-relaxed">{synthesis.summary}</span>
      </div>
    </div>
  )
}
