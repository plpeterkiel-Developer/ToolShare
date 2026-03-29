import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getUsageAnalytics, getPageDepth } from '@/lib/queries/admin'
import { UsageStatsTable } from '@/components/admin/UsageStatsTable'

interface AnalyticsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ days?: string }>
}

export default async function AnalyticsPage({ params, searchParams }: AnalyticsPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const { days: daysParam } = await searchParams
  const days = [7, 30, 90].includes(Number(daysParam)) ? Number(daysParam) : 30

  const t = await getTranslations('admin.analytics')
  const stats = await getUsageAnalytics(days)

  const pagesWithDepth = stats.topPages.map((p) => ({
    ...p,
    depth: getPageDepth(p.event_name),
  }))

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <a
              key={d}
              href={`/${locale}/admin/analytics?days=${d}`}
              className={[
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                d === days
                  ? 'bg-green-100 text-green-800'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
              ].join(' ')}
            >
              {t('period', { days: d })}
            </a>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-stone-200 bg-white px-5 py-4">
        <p className="text-sm text-stone-500">{t('totalEvents')}</p>
        <p className="text-3xl font-bold text-stone-900">{stats.totalEvents.toLocaleString()}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <UsageStatsTable
          title={t('topPages')}
          headers={[t('page'), t('visits'), t('depth')]}
          rows={pagesWithDepth.map((p) => ({
            label: p.event_name,
            path: p.page_path,
            count: p.count,
            depth: p.depth,
          }))}
          showDepth
        />

        <UsageStatsTable
          title={t('topActions')}
          headers={[t('action'), t('count')]}
          rows={stats.topActions.map((a) => ({
            label: a.event_name,
            count: a.count,
          }))}
        />
      </div>
    </div>
  )
}
