import { Badge } from '@/components/ui/Badge'
import type { RequestStatus } from '@/types/database.types'

export interface RequestStatusBadgeProps {
  status: RequestStatus
}

const statusConfig: Record<
  RequestStatus,
  { variant: 'green' | 'yellow' | 'red' | 'gray' | 'blue'; label: string }
> = {
  pending: { variant: 'yellow', label: 'Pending' },
  approved: { variant: 'green', label: 'Approved' },
  denied: { variant: 'red', label: 'Denied' },
  cancelled: { variant: 'gray', label: 'Cancelled' },
  returned: { variant: 'blue', label: 'Returned' },
  overdue: { variant: 'red', label: 'Overdue' },
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const config = statusConfig[status] ?? { variant: 'gray' as const, label: status }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
