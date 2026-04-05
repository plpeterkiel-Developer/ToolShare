'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { createBorrowRequest } from '@/lib/actions/requests'
import type { ToolWithOwner } from '@/types/database.types'

export interface BorrowRequestButtonProps {
  tool: ToolWithOwner
  currentUserId: string | null
}

export function BorrowRequestButton({ tool, currentUserId }: BorrowRequestButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState(false)
  const t = useTranslations('requests')
  const tTools = useTranslations('tools')
  const tCommon = useTranslations('common')

  // Don't show if user is the owner or tool not available
  if (!currentUserId || currentUserId === tool.owner_id || tool.availability !== 'available') {
    return null
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('tool_id', tool.id)

    const result = await createBorrowRequest(formData)
    if (result && 'error' in result && result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => {
      setOpen(false)
      setSuccess(false)
    }, 1500)
  }

  return (
    <>
      <Button
        type="button"
        variant="primary"
        onClick={() => {
          setError(undefined)
          setSuccess(false)
          setOpen(true)
        }}
        data-testid="request-to-borrow-button"
        aria-label={`${tTools('detail.requestBorrow')} ${tool.name}`}
      >
        {tTools('detail.requestBorrow')}
      </Button>

      <Modal
        open={open}
        onClose={() => !loading && setOpen(false)}
        title={t('borrowTitle', { name: tool.name })}
      >
        {success ? (
          <div
            role="status"
            className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 text-center"
          >
            {t('requestSent')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {error && (
              <div
                role="alert"
                data-testid="request-error"
                className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <Input
              id="start-date"
              name="start_date"
              type="date"
              label={t('form.startDate')}
              required
              data-testid="start-date-input"
              min={new Date().toISOString().split('T')[0]}
              defaultValue={new Date().toISOString().split('T')[0]}
            />
            <Input
              id="end-date"
              name="end_date"
              type="date"
              label={t('form.endDate')}
              required
              data-testid="end-date-input"
              min={new Date().toISOString().split('T')[0]}
              defaultValue={new Date().toISOString().split('T')[0]}
            />
            <Textarea
              id="borrow-message"
              name="message"
              label={t('form.message')}
              rows={3}
              data-testid="borrow-message"
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                data-testid="request-submit"
              >
                {t('form.submit')}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
