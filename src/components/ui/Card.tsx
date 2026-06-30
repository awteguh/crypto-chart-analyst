// src/components/ui/Card.tsx

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`
        bg-white/[0.04] border border-white/[0.08] rounded-2xl
        backdrop-blur-xl
        shadow-[0_0_30px_rgba(6,182,212,0.06)]
        p-4
        ${className}
      `}
    >
      {children}
    </div>
  )
}
