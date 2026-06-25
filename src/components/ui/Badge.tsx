// src/components/ui/Badge.tsx

interface BadgeProps {
  children: React.ReactNode
  variant?: 'bullish' | 'bearish' | 'neutral' | 'info'
}

export function Badge({ children, variant = 'info' }: BadgeProps) {
  const variants = {
    bullish: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    bearish: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}
