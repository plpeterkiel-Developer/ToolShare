'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { approveJoinRequest, denyJoinRequest } from '@/lib/actions/communities'
import type { CommunityJoinRequestAdminRow } from '@/lib/queries/communities'

interface CommunityJoinRequestsTableProps {
  requests: CommunityJoinRequestAdminRow[]
}

export function CommunityJoinRequestsTable({ requests }: CommunityJoinRequestsTableProps) {
  const t = useTranslations('communityAdmin')
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const act = async (
    id: string,
    fn: (id: string) => Promise<{ success?: boolean; error?: string }>
  ) => {
    setError(null)
    setBusyId(id)
    const res = await fn(id)
    setBusyId(null)
    if (res.error) setError(res.error)
    else startTransition(() => router.refresh())
  }

  if (requests.length === 0) {
    return (
      <p className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
        {t('noJoinRequests')}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200">
        {requests.map((req) => (
          <li
            key={req.id}
            className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            data-testid={`join-request-${req.id}`}
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-stone-900">
                {req.profile?.display_name ?? t('unknownUser')}
              </p>
              {req.pickup_address && (
                <p className="mt-1 text-sm text-stone-700">
                  <span className="font-medium">{t('requesterPickup')}:</span> {req.pickup_address}
                </p>
              )}
              {req.message && (
                <p className="mt-1 whitespace-pre-wrap text-sm text-stone-600">
                  &ldquo;{req.message}&rdquo;
                </p>
              )}
              <p className="mt-1 text-xs text-stone-400">
                {new Date(req.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => act(req.id, approveJoinRequest)}
                disabled={busyId === req.id}
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
              >
                {t('approve')}
              </button>
              <button
                type="button"
                onClick={() => act(req.id, (id) => denyJoinRequest(id))}
                disabled={busyId === req.id}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
              >
                {t('deny')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
