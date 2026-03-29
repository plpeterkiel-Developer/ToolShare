'use client'

import { useTranslations } from 'next-intl'

interface Row {
  label: string
  path?: string
  count: number
  depth?: number
}

interface UsageStatsTableProps {
  title: string
  headers: string[]
  rows: Row[]
  showDepth?: boolean
}

function DepthBadge({ depth }: { depth: number }) {
  const t = useTranslations('admin.analytics')

  if (depth < 0) return <span className="text-xs text-stone-400">-</span>

  const colors =
    depth === 0
      ? 'bg-green-100 text-green-800'
      : depth <= 1
        ? 'bg-blue-100 text-blue-800'
        : depth <= 2
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors}`}
    >
      {depth === 0 ? t('depthHome') : t('depthClicks', { count: depth })}
    </span>
  )
}

export function UsageStatsTable({ title, headers, rows, showDepth }: UsageStatsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-stone-900">{title}</h2>
        <p className="text-sm text-stone-500">No data yet</p>
      </div>
    )
  }

  const maxCount = Math.max(...rows.map((r) => r.count))

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-stone-900">{title}</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100">
            {headers.map((h) => (
              <th key={h} className="pb-2 text-left font-medium text-stone-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-stone-50 last:border-0">
              <td className="py-2.5">
                <div className="flex flex-col">
                  <span className="font-medium text-stone-900">{row.label}</span>
                  {row.path && <span className="text-xs text-stone-400">{row.path}</span>}
                </div>
              </td>
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-stone-100">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${(row.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-stone-700">{row.count.toLocaleString()}</span>
                </div>
              </td>
              {showDepth && (
                <td className="py-2.5">
                  <DepthBadge depth={row.depth ?? -1} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
