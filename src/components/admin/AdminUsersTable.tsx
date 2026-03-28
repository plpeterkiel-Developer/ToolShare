'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { SuspendUserButton } from '@/components/admin/SuspendUserButton'
import { WarnUserButton } from '@/components/admin/WarnUserButton'
import { AddToCommunityButton } from '@/components/admin/AddToCommunityButton'
import type { Profile } from '@/types/database.types'

type UserWithEmail = Profile & { email: string | null }

interface AdminUsersTableProps {
  users: UserWithEmail[]
  communities: { id: string; name: string }[]
}

export function AdminUsersTable({ users, communities }: AdminUsersTableProps) {
  const t = useTranslations('admin.users')
  const [searchQuery, setSearchQuery] = useState('')

  const query = searchQuery.trim().toLowerCase()
  const filteredUsers = query
    ? users.filter(
        (u) =>
          u.display_name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query)
      )
    : users

  return (
    <div>
      <div className="border-b border-stone-200 px-4 py-3">
        <div className="relative max-w-sm">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-xl border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-800 focus-visible:ring-offset-2"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                {t('name')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                {t('email')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                {t('status')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                {t('warnings')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                {t('joined')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 bg-white">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-stone-500">
                  {t('noResults')}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-stone-900">
                    {user.display_name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-500">
                    {user.email ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {user.is_suspended ? (
                      <Badge variant="red">{t('suspended')}</Badge>
                    ) : (
                      <Badge variant="green">{t('active')}</Badge>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-500">
                    {user.warning_count}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <SuspendUserButton userId={user.id} isSuspended={user.is_suspended} />
                      <WarnUserButton userId={user.id} />
                      <AddToCommunityButton userId={user.id} communities={communities} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
