'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import type { RequestStatus } from '@/types/database.types'

interface AdminRequest {
  id: string
  status: RequestStatus
  start_date: string | null
  end_date: string | null
  created_at: string
  tool: { id: string; name: string } | null
  borrower: { id: string; display_name: string } | null
  owner: { id: string; display_name: string } | null
}

interface AdminRequestsTableProps {
  requests: AdminRequest[]
}

const statusBadge: Record<RequestStatus, 'yellow' | 'green' | 'red' | 'gray' | 'blue'> = {
  pending: 'yellow',
  approved: 'green',
  denied: 'red',
  cancelled: 'gray',
  returned: 'blue',
  overdue: 'red',
}

export function AdminRequestsTable({ requests }: AdminRequestsTableProps) {
  const t = useTranslations('admin.requests')

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('tool')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('borrower')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('owner')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('status')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('period')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('created')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {requests.map((req) => (
            <tr key={req.id}>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                {req.tool?.name ?? '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {req.borrower?.display_name ?? '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {req.owner?.display_name ?? '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <Badge variant={statusBadge[req.status]}>{req.status}</Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {req.start_date && req.end_date
                  ? `${new Date(req.start_date).toLocaleDateString()} – ${new Date(req.end_date).toLocaleDateString()}`
                  : '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {new Date(req.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
