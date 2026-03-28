import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAllRequests } from '@/lib/queries/admin'
import { AdminRequestsTable } from '@/components/admin/AdminRequestsTable'

interface AdminRequestsPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminRequestsPage({ params }: AdminRequestsPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('admin.requests')
  const requests = await getAllRequests()

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">{t('title')}</h1>
      <div className="rounded-lg border border-gray-200 bg-white">
        <AdminRequestsTable requests={requests} />
      </div>
    </div>
  )
}
