// src/components/analysis/PumpDumpMeter.tsx

interface PumpDumpMeterProps {
  pumpProbability: number
  dumpProbability: number
  bias: 'PUMP' | 'DUMP' | 'NEUTRAL'
}

export function PumpDumpMeter({ pumpProbability, dumpProbability, bias }: PumpDumpMeterProps) {
  const biasEmoji = bias === 'PUMP' ? '🚀' : bias === 'DUMP' ? '📉' : '➡️'
  const biasColor =
    bias === 'PUMP'
      ? 'text-green-600 dark:text-green-400'
      : bias === 'DUMP'
      ? 'text-red-600 dark:text-red-400'
      : 'text-gray-600 dark:text-gray-400'

  return (
    <div className="space-y-2">
      <div className={`text-center text-lg font-bold ${biasColor}`}>
        {biasEmoji} {bias} — Candle Berikutnya
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-600 dark:text-green-400 w-10">PUMP</span>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${pumpProbability}%` }}
            />
          </div>
          <span className="text-xs font-bold text-green-600 dark:text-green-400 w-10 text-right">
            {pumpProbability}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-red-600 dark:text-red-400 w-10">DUMP</span>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all"
              style={{ width: `${dumpProbability}%` }}
            />
          </div>
          <span className="text-xs font-bold text-red-600 dark:text-red-400 w-10 text-right">
            {dumpProbability}%
          </span>
        </div>
      </div>
    </div>
  )
}
