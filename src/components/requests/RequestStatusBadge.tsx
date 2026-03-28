'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import type { RequestStatus } from '@/types/database.types'

export interface RequestStatusBadgeProps {
  status: RequestStatus
}

const statusVariants: Record<RequestStatus, 'green' | 'yellow' | 'red' | 'gray' | 'blue'> = {
  pending: 'yellow',
  approved: 'green',
  denied: 'red',
  cancelled: 'gray',
  returned: 'blue',
  overdue: 'red',
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const t = useTranslations('requests.status')
  const variant = statusVariants[status] ?? 'gray'
  return (
    <Badge variant={variant} data-testid="request-status">
      {t(status)}
    </Badge>
  )
}
