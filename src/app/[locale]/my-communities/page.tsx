import { redirect } from 'next/navigation'
import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getUser } from '@/lib/supabase/server'
import { getCurrentUserCommunityAdminships } from '@/lib/admin'
import {
  getUserCommunities,
  getUserPendingJoinRequests,
  getUserCreationRequests,
} from '@/lib/queries/communities'

interface MyCommunitiesPageProps {
  params: Promise<{ locale: string }>
}

export default async function MyCommunitiesPage({ params }: MyCommunitiesPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const user = await getUser()
  if (!user) redirect(`/${locale}/auth/login?next=/${locale}/my-communities`)

  const t = await getTranslations('myCommunities')

  const [communities, pendingJoins, creationRequests, adminOfIds] = await Promise.all([
    getUserCommunities(user.id),
    getUserPendingJoinRequests(user.id),
    getUserCreationRequests(user.id),
    getCurrentUserCommunityAdminships(),
  ])

  const adminOfSet = new Set(adminOfIds)
  const pendingCreations = creationRequests.filter((r) => r.status === 'pending')

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{t('title')}</h1>
          <p className="mt-2 text-stone-600">{t('subtitle')}</p>
        </div>
        <Link
          href={`/${locale}/onboarding`}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          {t('findCommunityCta')}
        </Link>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">{t('memberOfTitle')}</h2>
        {communities.length === 0 ? (
          <p className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
            {t('noMemberships')}
          </p>
        ) : (
          <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200">
            {communities.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
                data-testid={`membership-${c.id}`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-900">{c.name}</p>
                  {c.description && (
                    <p className="truncate text-sm text-stone-500">{c.description}</p>
                  )}
                </div>
                {adminOfSet.has(c.id) && (
                  <Link
                    href={`/${locale}/communities/${c.id}/manage`}
                    className="shrink-0 rounded-lg bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
                  >
                    {t('manageCta')}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {(pendingJoins.length > 0 || pendingCreations.length > 0) && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-stone-900">{t('pendingTitle')}</h2>
          <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200">
            {pendingJoins.map((req) => (
              <li key={req.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-900">{req.community.name}</p>
                  <p className="text-sm text-stone-500">{t('pendingJoin')}</p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                  {t('statusPending')}
                </span>
              </li>
            ))}
            {pendingCreations.map((req) => (
              <li key={req.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-900">{req.requested_name}</p>
                  <p className="text-sm text-stone-500">{t('pendingCreation')}</p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                  {t('statusPending')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
