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
  const base = 'px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-50',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600',
  }
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {isLoading ? 'Memuat...' : children}
    </button>
  )
}
