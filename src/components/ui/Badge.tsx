// src/components/ui/Badge.tsx

interface BadgeProps {
  children: React.ReactNode
  variant?: 'bullish' | 'bearish' | 'neutral' | 'info'
}

export function Badge({ children, variant = 'info' }: BadgeProps) {
  const variants = {
    bullish: 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400',
    bearish: 'bg-red-500/15 border border-red-500/30 text-red-400',
    neutral: 'bg-white/[0.06] border border-white/10 text-slate-400',
    info:    'bg-cyan-500/10 border border-cyan-500/25 text-cyan-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}
