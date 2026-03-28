'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { RequestStatusBadge } from '@/components/requests/RequestStatusBadge'
import { Button } from '@/components/ui/Button'
import { approveRequest, denyRequest, cancelRequest, markReturned } from '@/lib/actions/requests'
import type { RequestWithDetails } from '@/types/database.types'

export interface RequestCardProps {
  request: RequestWithDetails
  currentUserId: string
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function RequestCard({ request, currentUserId }: RequestCardProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | undefined>()
  const t = useTranslations('requests')

  const isOwner = currentUserId === request.owner_id
  const isBorrower = currentUserId === request.borrower_id

  async function handleAction(action: () => Promise<{ error?: string; success?: boolean }>) {
    setError(undefined)
    const result = await action()
    if (result?.error) {
      setError(result.error)
    }
    setLoading(null)
  }

  async function onApprove() {
    setLoading('approve')
    await handleAction(() => approveRequest(request.id))
  }

  async function onDeny() {
    setLoading('deny')
    await handleAction(() => denyRequest(request.id))
  }

  async function onCancel() {
    setLoading('cancel')
    await handleAction(() => cancelRequest(request.id))
  }

  async function onMarkReturned() {
    setLoading('returned')
    await handleAction(() => markReturned(request.id))
  }

  return (
    <article
      data-testid="request-card"
      className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t('tool')}</p>
          <p data-testid="request-tool-name" className="font-semibold text-gray-900">
            {request.tool.name}
          </p>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-gray-500">{t('borrower')}</p>
          <p data-testid="request-borrower" className="font-medium text-gray-800">
            {request.borrower.display_name}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{t('owner')}</p>
          <p data-testid="request-owner" className="font-medium text-gray-800">
            {request.owner.display_name}
          </p>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-gray-500">{t('startDate')}</p>
          <p data-testid="request-start-date">{formatDate(request.start_date)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{t('endDate')}</p>
          <p data-testid="request-end-date">{formatDate(request.end_date)}</p>
        </div>
      </div>

      {/* Message */}
      {request.message && (
        <div className="text-sm">
          <p className="text-xs text-gray-500">{t('message')}</p>
          <p data-testid="request-message" className="text-gray-700 italic">
            &ldquo;{request.message}&rdquo;
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        {isOwner && request.status === 'pending' && (
          <>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={loading === 'approve'}
              disabled={loading !== null}
              onClick={onApprove}
              data-testid="approve-button"
            >
              {t('approve')}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              loading={loading === 'deny'}
              disabled={loading !== null}
              onClick={onDeny}
              data-testid="deny-button"
            >
              {t('deny')}
            </Button>
          </>
        )}

        {isBorrower && request.status === 'pending' && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={loading === 'cancel'}
            disabled={loading !== null}
            onClick={onCancel}
            data-testid="cancel-button"
          >
            {t('cancelRequest')}
          </Button>
        )}

        {isOwner && request.status === 'approved' && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={loading === 'returned'}
            disabled={loading !== null}
            onClick={onMarkReturned}
            data-testid="mark-returned-button"
          >
            {t('markReturned')}
          </Button>
        )}
      </div>
    </article>
  )
}
