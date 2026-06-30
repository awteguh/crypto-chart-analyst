// src/components/analysis/SignalSummary.tsx

import type { TradeSignal } from '@/types/analysis'

interface SignalItem {
  label: string
  value: string
  borderColor: string
  valueClass?: string
}

export function SignalSummary({ signal }: { signal: TradeSignal }) {
  const items: SignalItem[] = [
    {
      label: 'ENTRY',
      value: signal.entry,
      borderColor: 'border-l-cyan-500',
    },
    {
      label: 'R:R',
      value: signal.risk_reward,
      borderColor: 'border-l-amber-500',
      valueClass: 'text-2xl font-black text-amber-400 leading-none',
    },
    {
      label: 'STOP LOSS',
      value: signal.stop_loss,
      borderColor: 'border-l-red-500',
    },
    {
      label: 'TAKE PROFIT',
      value: signal.take_profit,
      borderColor: 'border-l-emerald-500',
    },
  ]

  return (
    <div>
      <h4 className="text-[9px] font-bold tracking-[1.5px] uppercase text-slate-600 mb-2">
        Sinyal Trading
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={`bg-white/[0.03] border border-white/[0.06] border-l-2 ${item.borderColor} rounded-xl p-3`}
          >
            <div className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-1">
              {item.label}
            </div>
            <div className={item.valueClass ?? 'text-xs text-slate-300 leading-relaxed'}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
