import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { getAllCommunities } from '@/lib/queries/admin'
import { AdminCommunitiesTable } from '@/components/admin/AdminCommunitiesTable'
import { CreateCommunityForm } from '@/components/admin/CreateCommunityForm'

interface AdminCommunitiesPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminCommunitiesPage({ params }: AdminCommunitiesPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('admin.communities')
  const communities = await getAllCommunities()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      </div>
      <div className="mb-8">
        <CreateCommunityForm />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white">
        <AdminCommunitiesTable communities={communities} locale={locale} />
      </div>
    </div>
  )
}
