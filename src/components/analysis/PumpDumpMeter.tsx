// src/components/analysis/PumpDumpMeter.tsx

interface PumpDumpMeterProps {
  pumpProbability: number
  dumpProbability: number
  bias: 'PUMP' | 'DUMP' | 'NEUTRAL'
}

export function PumpDumpMeter({ pumpProbability, dumpProbability, bias }: PumpDumpMeterProps) {
  const biasEmoji = bias === 'PUMP' ? '🚀' : bias === 'DUMP' ? '📉' : '➡️'

  const biasClass =
    bias === 'PUMP'
      ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]'
      : bias === 'DUMP'
      ? 'text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]'
      : 'text-slate-400'

  return (
    <div className="space-y-3">
      <div className={`text-center text-xl font-black tracking-tight ${biasClass}`}>
        {biasEmoji} {bias} — Candle Berikutnya
      </div>

      <div className="space-y-2">
        {/* PUMP */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-emerald-400 w-10">PUMP</span>
          <div className="flex-1 bg-white/[0.06] rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-700"
              style={{ width: `${pumpProbability}%` }}
            />
          </div>
          <span className="text-xs font-black text-emerald-400 w-10 text-right">
            {pumpProbability}%
          </span>
        </div>

        {/* DUMP */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-red-400 w-10">DUMP</span>
          <div className="flex-1 bg-white/[0.06] rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)] transition-all duration-700"
              style={{ width: `${dumpProbability}%` }}
            />
          </div>
          <span className="text-xs font-black text-red-400 w-10 text-right">
            {dumpProbability}%
          </span>
        </div>
      </div>
    </div>
  )
}
