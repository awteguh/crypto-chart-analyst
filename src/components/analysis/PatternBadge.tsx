// src/components/analysis/PatternBadge.tsx

import type { Pattern } from '@/types/analysis'
import { Badge } from '@/components/ui/Badge'

export function PatternBadge({ pattern }: { pattern: Pattern }) {
  const variant =
    pattern.bias === 'Bullish'
      ? 'bullish'
      : pattern.bias === 'Bearish'
      ? 'bearish'
      : 'neutral'

  return (
    <Badge variant={variant}>
      {pattern.name} {pattern.confidence}%
    </Badge>
  )
}
