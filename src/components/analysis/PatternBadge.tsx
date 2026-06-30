// src/components/analysis/PatternBadge.tsx

import type { Pattern } from '@/types/analysis'

export function PatternBadge({ pattern }: { pattern: Pattern }) {
  const style =
    pattern.bias === 'Bullish'
      ? 'bg-amber-500/[0.12] border border-amber-500/30 text-amber-400'
      : pattern.bias === 'Bearish'
      ? 'bg-red-500/[0.12] border border-red-500/30 text-red-400'
      : 'bg-white/[0.06] border border-white/10 text-slate-400'

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${style}`}>
      {pattern.bias === 'Bullish' ? '▲' : pattern.bias === 'Bearish' ? '▼' : '●'}{' '}
      {pattern.name} {pattern.confidence}%
    </span>
  )
}
