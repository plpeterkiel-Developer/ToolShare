import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getUser } from '@/lib/supabase/server'
import { requireCommunityAdmin } from '@/lib/admin'
import { getCommunityById, getCommunityMembers } from '@/lib/queries/admin'
import { getCommunityJoinRequests } from '@/lib/queries/communities'
import { CommunityJoinRequestsTable } from '@/components/admin/CommunityJoinRequestsTable'

interface ManageCommunityPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function ManageCommunityPage({ params }: ManageCommunityPageProps) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const user = await getUser()
  if (!user) redirect(`/${locale}/auth/login?next=/${locale}/communities/${id}/manage`)

  const guard = await requireCommunityAdmin(id)
  if (guard) redirect(`/${locale}`)

  const community = await getCommunityById(id)
  if (!community) notFound()

  const t = await getTranslations('communityAdmin')

  const [joinRequests, members] = await Promise.all([
    getCommunityJoinRequests(id, 'pending'),
    getCommunityMembers(id),
  ])

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href={`/${locale}`} className="text-sm text-stone-500 hover:text-stone-700">
          &larr; {t('back')}
        </Link>
      </div>
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-stone-500">
          {t('managingLabel')}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-stone-900">{community.name}</h1>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">
          {t('joinRequestsTitle')}{' '}
          {joinRequests.length > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              {joinRequests.length}
            </span>
          )}
        </h2>
        <CommunityJoinRequestsTable requests={joinRequests} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-stone-900">{t('membersTitle')}</h2>
        <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200">
          {members.map((m) => (
            <li key={m.profile_id} className="px-4 py-3 text-sm text-stone-900">
              {m.profile?.display_name ?? t('unknownUser')}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
