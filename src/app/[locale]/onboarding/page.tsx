import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getUser } from '@/lib/supabase/server'
import {
  getUserCommunityIds,
  getUserPendingJoinRequests,
  getUserCreationRequests,
} from '@/lib/queries/communities'
import { CommunitySearchPicker } from '@/components/onboarding/CommunitySearchPicker'
import { RequestNewCommunityForm } from '@/components/onboarding/RequestNewCommunityForm'
import { PendingRequestsList } from '@/components/onboarding/PendingRequestsList'

interface OnboardingPageProps {
  params: Promise<{ locale: string }>
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const user = await getUser()
  if (!user) redirect(`/${locale}/auth/login?next=/${locale}/onboarding`)

  const t = await getTranslations('onboarding')

  const [memberCommunityIds, joinRequests, creationRequests] = await Promise.all([
    getUserCommunityIds(user.id),
    getUserPendingJoinRequests(user.id),
    getUserCreationRequests(user.id),
  ])

  const pendingCommunityIds = joinRequests.map((r) => r.community_id)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">{t('title')}</h1>
        <p className="mt-2 text-stone-600">{t('subtitle')}</p>
      </header>

      <div className="space-y-8">
        <PendingRequestsList joinRequests={joinRequests} creationRequests={creationRequests} />

        <section aria-labelledby="join-community-heading" className="space-y-4">
          <h2 id="join-community-heading" className="text-lg font-semibold text-stone-900">
            {t('joinTitle')}
          </h2>
          <CommunitySearchPicker
            pendingCommunityIds={pendingCommunityIds}
            memberCommunityIds={memberCommunityIds}
          />
        </section>

        <section aria-labelledby="request-new-heading" className="space-y-3">
          <h2 id="request-new-heading" className="sr-only">
            {t('requestNewTitle')}
          </h2>
          <RequestNewCommunityForm />
        </section>
      </div>
    </div>
  )
}
