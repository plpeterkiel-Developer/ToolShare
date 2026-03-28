'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { SuspendUserButton } from '@/components/admin/SuspendUserButton'
import { WarnUserButton } from '@/components/admin/WarnUserButton'
import type { Profile } from '@/types/database.types'

type UserWithEmail = Profile & { email: string | null }

interface AdminUsersTableProps {
  users: UserWithEmail[]
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const t = useTranslations('admin.users')

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('name')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('email')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('status')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('warnings')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('joined')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                {user.display_name}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {user.email ?? '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                {user.is_suspended ? (
                  <Badge variant="red">{t('suspended')}</Badge>
                ) : (
                  <Badge variant="green">{t('active')}</Badge>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {user.warning_count}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <div className="flex gap-2">
                  <SuspendUserButton userId={user.id} isSuspended={user.is_suspended} />
                  <WarnUserButton userId={user.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
