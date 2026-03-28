import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAdminDashboardStats } from '@/lib/queries/admin'
import { StatCard } from '@/components/admin/StatCard'

interface AdminDashboardProps {
  params: Promise<{ locale: string }>
}

export default async function AdminDashboard({ params }: AdminDashboardProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('admin.dashboard')
  const stats = await getAdminDashboardStats()

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">{t('title')}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('totalUsers')} value={stats.totalUsers} />
        <StatCard label={t('totalTools')} value={stats.totalTools} />
        <StatCard label={t('activeLoans')} value={stats.activeLoans} />
        <StatCard label={t('openReports')} value={stats.openReports} />
      </div>
    </div>
  )
}
