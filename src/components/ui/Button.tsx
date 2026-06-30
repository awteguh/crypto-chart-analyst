// src/components/ui/Button.tsx

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  isLoading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  isLoading,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'px-4 py-2.5 rounded-xl font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 flex items-center justify-center gap-2'
  const variants = {
    primary: `
      bg-gradient-to-r from-amber-500 to-orange-500
      text-[#080B14]
      shadow-[0_4px_20px_rgba(245,158,11,0.35)]
      hover:shadow-[0_6px_28px_rgba(245,158,11,0.5)]
      hover:-translate-y-0.5
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
    `,
    secondary: `
      bg-white/[0.06] border border-white/10
      text-slate-400
      hover:bg-white/[0.08] hover:text-slate-300
      disabled:opacity-40
    `,
  }
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Memuat...
        </>
      ) : children}
    </button>
  )
}
