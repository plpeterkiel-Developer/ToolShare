import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getAllCommunityCreationRequests } from '@/lib/queries/communities'
import { CommunityCreationRequestsTable } from '@/components/admin/CommunityCreationRequestsTable'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminCommunityRequestsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('communityAdmin')

  const pending = await getAllCommunityCreationRequests('pending')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">{t('creationRequestsTitle')}</h1>
        <p className="mt-1 text-sm text-stone-500">{t('creationRequestsSubtitle')}</p>
      </div>
      <CommunityCreationRequestsTable requests={pending} />
    </div>
  )
}
