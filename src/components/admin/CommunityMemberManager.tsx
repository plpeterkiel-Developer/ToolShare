'use client'

import { useTranslations } from 'next-intl'
import { RemoveMemberButton } from '@/components/admin/RemoveMemberButton'
import { AddMemberForm } from '@/components/admin/AddMemberForm'

interface MemberRow {
  profile_id: string
  joined_at: string
  profile: { id: string; display_name: string }
}

interface CommunityMemberManagerProps {
  communityId: string
  members: MemberRow[]
  availableUsers: { id: string; display_name: string }[]
}

export function CommunityMemberManager({
  communityId,
  members,
  availableUsers,
}: CommunityMemberManagerProps) {
  const t = useTranslations('admin.communities')

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        {t('members')} ({members.length})
      </h2>

      <div className="mb-6">
        <AddMemberForm communityId={communityId} availableUsers={availableUsers} />
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-gray-500">{t('noMembers')}</p>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  {t('memberName')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  {t('joinedAt')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {members.map((member) => (
                <tr key={member.profile_id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                    {member.profile.display_name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {new Date(member.joined_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <RemoveMemberButton communityId={communityId} profileId={member.profile_id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
