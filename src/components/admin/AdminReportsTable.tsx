'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { ResolveReportButton } from '@/components/admin/ResolveReportButton'
import type { ReportReason } from '@/types/database.types'

interface AdminReport {
  id: string
  reason: ReportReason
  details: string | null
  resolved: boolean
  created_at: string
  reporter: { id: string; display_name: string } | null
  reported_user: { id: string; display_name: string } | null
  reported_tool: { id: string; name: string } | null
}

interface AdminReportsTableProps {
  reports: AdminReport[]
}

export function AdminReportsTable({ reports }: AdminReportsTableProps) {
  const t = useTranslations('admin.reports')

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('reason')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('reporter')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('reported')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('details')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('status')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('date')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {reports.map((report) => (
            <tr key={report.id}>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                {report.reason}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {report.reporter?.display_name ?? '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {report.reported_user?.display_name ?? report.reported_tool?.name ?? '—'}
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-500">
                {report.details ?? '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                {report.resolved ? (
                  <Badge variant="green">{t('resolved')}</Badge>
                ) : (
                  <Badge variant="yellow">{t('open')}</Badge>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {new Date(report.created_at).toLocaleDateString()}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                {!report.resolved && <ResolveReportButton reportId={report.id} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
