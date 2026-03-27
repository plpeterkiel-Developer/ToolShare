'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { deleteTool } from '@/lib/actions/tools'

export interface DeleteToolButtonProps {
  toolId: string
  locale: string
}

export function DeleteToolButton({ toolId, locale }: DeleteToolButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  async function handleDelete() {
    setError(undefined)
    setLoading(true)
    const result = await deleteTool(toolId)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      setOpen(false)
    }
    // On success, deleteTool redirects — no need to close modal
  }

  return (
    <>
      <Button
        type="button"
        variant="danger"
        onClick={() => {
          setError(undefined)
          setOpen(true)
        }}
        data-testid="delete-tool-button"
      >
        Delete
      </Button>

      <Modal open={open} onClose={() => !loading && setOpen(false)} title="Delete tool">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete this tool? This action cannot be undone.
          </p>
          {error && (
            <p
              role="alert"
              data-testid="delete-tool-error"
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={loading}
              onClick={handleDelete}
              data-testid="confirm-delete-button"
            >
              Yes, delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
