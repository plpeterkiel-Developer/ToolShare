import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAllReports } from '@/lib/queries/admin'
import { AdminReportsTable } from '@/components/admin/AdminReportsTable'

interface AdminReportsPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminReportsPage({ params }: AdminReportsPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('admin.reports')
  const reports = await getAllReports()

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">{t('title')}</h1>
      <div className="rounded-lg border border-gray-200 bg-white">
        <AdminReportsTable reports={reports} />
      </div>
    </div>
  )
}
