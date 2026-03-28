import React from 'react'

export interface BadgeProps {
  variant: 'green' | 'yellow' | 'red' | 'gray' | 'blue'
  children: React.ReactNode
  'data-testid'?: string
}

const variantClasses: Record<BadgeProps['variant'], string> = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-800',
}

export function Badge({ variant, children, 'data-testid': testId }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
      ].join(' ')}
      data-testid={testId}
    >
      {children}
    </span>
  )
}
