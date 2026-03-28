'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { DeleteToolButton } from '@/components/admin/DeleteToolButton'
import type { ToolAvailability } from '@/types/database.types'

interface AdminTool {
  id: string
  name: string
  category: string
  availability: ToolAvailability
  created_at: string
  owner: { id: string; display_name: string } | null
}

interface AdminToolsTableProps {
  tools: AdminTool[]
}

const availabilityBadge: Record<ToolAvailability, 'green' | 'yellow' | 'gray'> = {
  available: 'green',
  on_loan: 'yellow',
  unavailable: 'gray',
}

export function AdminToolsTable({ tools }: AdminToolsTableProps) {
  const t = useTranslations('admin.tools')

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('name')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('owner')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('category')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('availability')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('created')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {tools.map((tool) => (
            <tr key={tool.id}>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                {tool.name}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {tool.owner?.display_name ?? '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{tool.category}</td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <Badge variant={availabilityBadge[tool.availability]}>{tool.availability}</Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {new Date(tool.created_at).toLocaleDateString()}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <DeleteToolButton toolId={tool.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
