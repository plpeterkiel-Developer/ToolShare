import { notFound } from 'next/navigation'
import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import {
  getCommunityById,
  getCommunityMembers,
  getAllUsersForMemberSelect,
} from '@/lib/queries/admin'
import { getCommunityJoinRequests, getCommunityAdminsWithProfiles } from '@/lib/queries/communities'
import { CommunityMemberManager } from '@/components/admin/CommunityMemberManager'
import { CommunityJoinRequestsTable } from '@/components/admin/CommunityJoinRequestsTable'
import { CommunityAdminsList } from '@/components/admin/CommunityAdminsList'

interface CommunityDetailPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function CommunityDetailPage({ params }: CommunityDetailPageProps) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const t = await getTranslations('admin.communities')
  const tCA = await getTranslations('communityAdmin')

  const community = await getCommunityById(id)
  if (!community) notFound()

  const [members, allUsers, joinRequests, communityAdmins] = await Promise.all([
    getCommunityMembers(id),
    getAllUsersForMemberSelect(),
    getCommunityJoinRequests(id, 'pending'),
    getCommunityAdminsWithProfiles(id),
  ])

  // Filter out users who are already members (for "add member" select)
  const memberIds = new Set(members.map((m: { profile_id: string }) => m.profile_id))
  const availableUsers = allUsers.filter((u: { id: string }) => !memberIds.has(u.id))

  // Candidates for community admin: members who aren't already admins
  const adminIds = new Set(communityAdmins.map((a) => a.profile_id))
  const candidateAdminUsers = members
    .filter((m) => !adminIds.has(m.profile_id))
    .map((m) => ({
      id: m.profile_id,
      display_name: m.profile?.display_name ?? null,
    }))

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/${locale}/admin/communities`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; {t('backToList')}
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{community.name}</h1>
        {community.description && (
          <p className="mt-1 text-sm text-gray-500">{community.description}</p>
        )}
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">{tCA('joinRequestsTitle')}</h2>
        <CommunityJoinRequestsTable requests={joinRequests} />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">{tCA('adminsTitle')}</h2>
        <CommunityAdminsList
          communityId={community.id}
          admins={communityAdmins}
          candidateUsers={candidateAdminUsers}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-stone-900">{tCA('membersTitle')}</h2>
        <CommunityMemberManager
          communityId={community.id}
          members={members}
          availableUsers={availableUsers}
        />
      </section>
    </div>
  )
}
