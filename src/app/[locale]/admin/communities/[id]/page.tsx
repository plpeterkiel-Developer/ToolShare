import { notFound } from 'next/navigation'
import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import {
  getCommunityById,
  getCommunityMembers,
  getAllUsersForMemberSelect,
} from '@/lib/queries/admin'
import { CommunityMemberManager } from '@/components/admin/CommunityMemberManager'

interface CommunityDetailPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function CommunityDetailPage({ params }: CommunityDetailPageProps) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const t = await getTranslations('admin.communities')

  const community = await getCommunityById(id)
  if (!community) notFound()

  const members = await getCommunityMembers(id)
  const allUsers = await getAllUsersForMemberSelect()

  // Filter out users who are already members
  const memberIds = new Set(members.map((m: { profile_id: string }) => m.profile_id))
  const availableUsers = allUsers.filter((u: { id: string }) => !memberIds.has(u.id))

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
      <CommunityMemberManager
        communityId={community.id}
        members={members}
        availableUsers={availableUsers}
      />
    </div>
  )
}
