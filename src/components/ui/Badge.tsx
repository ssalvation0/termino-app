import { type ReactNode } from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  children: ReactNode
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'pending'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'brand', size = 'md' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 font-medium rounded-full',
        {
          'bg-brand-100 text-brand-700': variant === 'brand',
          'bg-emerald-100 text-emerald-700': variant === 'success',
          'bg-amber-100 text-amber-700': variant === 'warning',
          'bg-red-100 text-red-600': variant === 'danger',
          'bg-gray-100 text-gray-600': variant === 'neutral',
          'bg-blue-100 text-blue-700': variant === 'pending',
        },
        {
          'text-xs px-2 py-0.5': size === 'sm',
          'text-sm px-2.5 py-1': size === 'md',
        },
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    pending:     { label: 'Oczekująca', variant: 'pending' },
    confirmed:   { label: 'Potwierdzona', variant: 'success' },
    alternative: { label: 'Oferta alternatywna', variant: 'warning' },
    rescheduled: { label: 'Przełożona', variant: 'warning' },
    completed:   { label: 'Zakończona', variant: 'neutral' },
    cancelled:   { label: 'Anulowana', variant: 'danger' },
  }
  const entry = map[status] ?? { label: status, variant: 'neutral' as const }
  return <Badge variant={entry.variant}>{entry.label}</Badge>
}
