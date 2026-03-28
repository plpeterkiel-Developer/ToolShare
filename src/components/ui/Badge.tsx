import React from 'react'

export interface BadgeProps {
  variant: 'green' | 'yellow' | 'red' | 'gray' | 'blue'
  children: React.ReactNode
  'data-testid'?: string
}

const variantClasses: Record<BadgeProps['variant'], string> = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-stone-100 text-stone-600',
  blue: 'bg-sky-100 text-sky-800',
}

export function Badge({ variant, children, 'data-testid': testId }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        variantClasses[variant],
      ].join(' ')}
      data-testid={testId}
    >
      {children}
    </span>
  )
}
