'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { DeleteCommunityButton } from '@/components/admin/DeleteCommunityButton'
import type { CommunityWithMemberCount } from '@/types/database.types'

interface AdminCommunitiesTableProps {
  communities: CommunityWithMemberCount[]
  locale: string
}

export function AdminCommunitiesTable({ communities, locale }: AdminCommunitiesTableProps) {
  const t = useTranslations('admin.communities')

  if (communities.length === 0) {
    return <div className="px-4 py-8 text-center text-sm text-gray-500">{t('noCommunities')}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('name')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('description')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('members')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('created')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {communities.map((community) => (
            <tr key={community.id}>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                <Link
                  href={`/${locale}/admin/communities/${community.id}`}
                  className="text-green-700 hover:text-green-800 hover:underline"
                >
                  {community.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                {community.description ?? '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {community.member_count}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {new Date(community.created_at).toLocaleDateString()}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <DeleteCommunityButton communityId={community.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
