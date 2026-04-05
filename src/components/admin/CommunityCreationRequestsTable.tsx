'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { approveCommunityCreation, denyCommunityCreation } from '@/lib/actions/admin'
import type { CreationRequestAdminRow } from '@/lib/queries/communities'

interface Props {
  requests: CreationRequestAdminRow[]
}

export function CommunityCreationRequestsTable({ requests }: Props) {
  const t = useTranslations('communityAdmin')
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [denyingId, setDenyingId] = useState<string | null>(null)
  const [denyReason, setDenyReason] = useState('')
  const [, startTransition] = useTransition()

  const handleApprove = async (req: CreationRequestAdminRow) => {
    setError(null)
    setBusyId(req.id)
    const name = editingId === req.id ? editName : req.requested_name
    const description = editingId === req.id ? editDescription : req.description
    const res = await approveCommunityCreation(req.id, name, description)
    setBusyId(null)
    if ('error' in res && res.error) {
      setError(res.error)
      return
    }
    setEditingId(null)
    startTransition(() => router.refresh())
  }

  const handleDeny = async (id: string) => {
    setError(null)
    setBusyId(id)
    const res = await denyCommunityCreation(id, denyReason || null)
    setBusyId(null)
    if ('error' in res && res.error) {
      setError(res.error)
      return
    }
    setDenyingId(null)
    setDenyReason('')
    startTransition(() => router.refresh())
  }

  const beginEdit = (req: CreationRequestAdminRow) => {
    setEditingId(req.id)
    setEditName(req.requested_name)
    setEditDescription(req.description ?? '')
  }

  if (requests.length === 0) {
    return (
      <p className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
        {t('noCreationRequests')}
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
      <ul className="space-y-3">
        {requests.map((req) => (
          <li
            key={req.id}
            data-testid={`creation-request-${req.id}`}
            className="rounded-lg border border-stone-200 bg-white p-4"
          >
            <div className="mb-3">
              {editingId === req.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  />
                </div>
              ) : (
                <>
                  <p className="font-semibold text-stone-900">{req.requested_name}</p>
                  {(req.city || req.address) && (
                    <p className="mt-1 text-sm text-stone-700">
                      📍 {[req.city, req.address].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {req.pickup_address && (
                    <p className="mt-1 text-sm text-stone-600">
                      <span className="font-medium">{t('requesterPickup')}:</span>{' '}
                      {req.pickup_address}
                    </p>
                  )}
                  {req.description && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-stone-600">
                      {req.description}
                    </p>
                  )}
                </>
              )}
              <p className="mt-2 text-xs text-stone-400">
                {t('requestedBy')}{' '}
                <strong className="text-stone-600">
                  {req.requester?.display_name ?? t('unknownUser')}
                </strong>{' '}
                · {new Date(req.created_at).toLocaleDateString()}
              </p>
            </div>

            {denyingId === req.id ? (
              <div className="space-y-2">
                <textarea
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  rows={2}
                  placeholder={t('denyReasonPlaceholder')}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeny(req.id)}
                    disabled={busyId === req.id}
                    className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
                  >
                    {t('confirmDeny')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDenyingId(null)
                      setDenyReason('')
                    }}
                    className="text-sm text-stone-600 hover:text-stone-900"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleApprove(req)}
                  disabled={busyId === req.id}
                  className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {t('approve')}
                </button>
                {editingId === req.id ? (
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                  >
                    {t('cancel')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => beginEdit(req)}
                    disabled={busyId === req.id}
                    className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                  >
                    {t('editBeforeApprove')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDenyingId(req.id)}
                  disabled={busyId === req.id}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {t('deny')}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
