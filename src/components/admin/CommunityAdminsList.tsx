'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { addCommunityAdmin, removeCommunityAdmin } from '@/lib/actions/admin'
import type { CommunityAdminWithProfile } from '@/lib/queries/communities'

interface CommunityAdminsListProps {
  communityId: string
  admins: CommunityAdminWithProfile[]
  /** Users available to promote (community members not yet admin). */
  candidateUsers: Array<{ id: string; display_name: string | null }>
}

export function CommunityAdminsList({
  communityId,
  admins,
  candidateUsers,
}: CommunityAdminsListProps) {
  const t = useTranslations('communityAdmin')
  const router = useRouter()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const handleAdd = async () => {
    if (!selectedUserId) return
    setError(null)
    setBusy(true)
    const res = await addCommunityAdmin(communityId, selectedUserId)
    setBusy(false)
    if ('error' in res && res.error) {
      setError(res.error)
      return
    }
    setSelectedUserId('')
    startTransition(() => router.refresh())
  }

  const handleRemove = async (profileId: string) => {
    setError(null)
    setBusy(true)
    const res = await removeCommunityAdmin(communityId, profileId)
    setBusy(false)
    if ('error' in res && res.error) {
      setError(res.error)
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-4">
      {admins.length === 0 ? (
        <p className="text-sm text-stone-500">{t('noAdmins')}</p>
      ) : (
        <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200">
          {admins.map((a) => (
            <li
              key={a.profile_id}
              className="flex items-center justify-between px-4 py-3"
              data-testid={`community-admin-${a.profile_id}`}
            >
              <span className="font-medium text-stone-900">
                {a.profile?.display_name ?? t('unknownUser')}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(a.profile_id)}
                disabled={busy}
                className="text-sm font-medium text-red-700 hover:text-red-900 disabled:opacity-50"
              >
                {t('removeAdmin')}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
        >
          <option value="">{t('selectUserPrompt')}</option>
          {candidateUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.display_name ?? t('unknownUser')}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy || !selectedUserId}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
        >
          {t('addAdmin')}
        </button>
      </div>
    </div>
  )
}
