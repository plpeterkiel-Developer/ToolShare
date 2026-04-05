'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cancelJoinRequest } from '@/lib/actions/communities'
import type { JoinRequestWithCommunity, CreationRequestRow } from '@/lib/queries/communities'

interface PendingRequestsListProps {
  joinRequests: JoinRequestWithCommunity[]
  creationRequests: CreationRequestRow[]
}

export function PendingRequestsList({ joinRequests, creationRequests }: PendingRequestsListProps) {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const handleCancel = async (requestId: string) => {
    const res = await cancelJoinRequest(requestId)
    if ('success' in res && res.success) {
      startTransition(() => router.refresh())
    }
  }

  const pendingCreation = creationRequests.filter((r) => r.status === 'pending')
  if (joinRequests.length === 0 && pendingCreation.length === 0) return null

  return (
    <section aria-labelledby="pending-requests-heading" className="space-y-3">
      <h2 id="pending-requests-heading" className="text-lg font-semibold text-stone-900">
        {t('pendingRequestsTitle')}
      </h2>
      <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200">
        {joinRequests.map((req) => (
          <li
            key={req.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
            data-testid={`pending-join-${req.id}`}
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-stone-900">{req.community.name}</p>
              <p className="text-sm text-stone-500">{t('statusPendingJoin')}</p>
            </div>
            <button
              type="button"
              onClick={() => handleCancel(req.id)}
              disabled={pending}
              className="shrink-0 text-sm font-medium text-stone-600 hover:text-red-700"
            >
              {t('cancel')}
            </button>
          </li>
        ))}
        {pendingCreation.map((req) => (
          <li
            key={req.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
            data-testid={`pending-creation-${req.id}`}
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-stone-900">{req.requested_name}</p>
              <p className="text-sm text-stone-500">{t('statusPendingCreation')}</p>
            </div>
            <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              {t('statusPending')}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
