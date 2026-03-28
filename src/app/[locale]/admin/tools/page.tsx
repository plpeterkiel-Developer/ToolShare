import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAllTools } from '@/lib/queries/admin'
import { AdminToolsTable } from '@/components/admin/AdminToolsTable'

interface AdminToolsPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminToolsPage({ params }: AdminToolsPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('admin.tools')
  const tools = await getAllTools()

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">{t('title')}</h1>
      <div className="rounded-lg border border-gray-200 bg-white">
        <AdminToolsTable tools={tools} />
      </div>
    </div>
  )
}
