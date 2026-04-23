import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading,
  fullWidth,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none',
        {
          'bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98] shadow-sm hover:shadow-md': variant === 'primary',
          'bg-white text-gray-800 border border-gray-200 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50': variant === 'secondary',
          'text-gray-600 hover:text-brand-600 hover:bg-brand-50': variant === 'ghost',
          'border-2 border-brand-600 text-brand-600 hover:bg-brand-50': variant === 'outline',
          'bg-red-500 text-white hover:bg-red-600': variant === 'danger',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-5 py-2.5 text-sm': size === 'md',
          'px-7 py-3.5 text-base': size === 'lg',
        },
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  )
}
