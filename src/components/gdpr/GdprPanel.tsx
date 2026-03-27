'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { downloadMyData, requestErasure } from '@/lib/actions/gdpr'

export function GdprPanel() {
  const { addToast } = useToast()
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [erasureOpen, setErasureOpen] = useState(false)
  const [erasureLoading, setErasureLoading] = useState(false)
  const [erasureRequested, setErasureRequested] = useState(false)

  async function handleDownload() {
    setDownloadLoading(true)
    const result = await downloadMyData()
    setDownloadLoading(false)
    if (result?.error) {
      addToast('error', result.error)
    } else {
      addToast('success', 'Data export email sent — check your inbox.')
    }
  }

  async function handleErasure() {
    setErasureLoading(true)
    const result = await requestErasure()
    setErasureLoading(false)
    if (result?.error) {
      addToast('error', result.error)
      setErasureOpen(false)
      return
    }
    setErasureRequested(true)
    setErasureOpen(false)
  }

  return (
    <div className="flex flex-col gap-8" data-testid="gdpr-panel">
      {/* 1. Download data */}
      <section aria-labelledby="gdpr-download-heading" className="flex flex-col gap-3">
        <h2 id="gdpr-download-heading" className="text-base font-semibold text-gray-900">
          Download your data
        </h2>
        <p className="text-sm text-gray-600">
          Request a copy of all data ToolShare holds about you. We will send a JSON export to your
          registered email address.
        </p>
        <div>
          <Button
            type="button"
            variant="secondary"
            loading={downloadLoading}
            onClick={handleDownload}
            data-testid="gdpr-download-button"
            aria-label="Download my data"
          >
            Download my data
          </Button>
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* 2. Request erasure */}
      <section aria-labelledby="gdpr-erasure-heading" className="flex flex-col gap-3">
        <h2 id="gdpr-erasure-heading" className="text-base font-semibold text-gray-900">
          Request account erasure
        </h2>
        <p className="text-sm text-gray-600">
          You may request that ToolShare delete your personal data. Your account will be anonymised
          within 30 days of the request.
        </p>
        {erasureRequested ? (
          <div
            role="status"
            data-testid="gdpr-erasure-confirmation"
            className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            Your erasure request has been recorded. Your data will be removed within 30 days.
          </div>
        ) : (
          <div>
            <Button
              type="button"
              variant="danger"
              onClick={() => setErasureOpen(true)}
              data-testid="gdpr-erasure-button"
              aria-label="Request account erasure"
            >
              Request erasure
            </Button>
          </div>
        )}
      </section>

      {/* Erasure confirmation modal */}
      <Modal
        open={erasureOpen}
        onClose={() => !erasureLoading && setErasureOpen(false)}
        title="Confirm account erasure"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to request account erasure? This action cannot be undone. Your
            personal data will be permanently deleted within 30 days.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={erasureLoading}
              onClick={() => setErasureOpen(false)}
              data-testid="gdpr-erasure-cancel"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={erasureLoading}
              onClick={handleErasure}
              data-testid="gdpr-erasure-confirm"
            >
              Yes, delete my data
            </Button>
          </div>
        </div>
      </Modal>

      <hr className="border-gray-200" />

      {/* 3. Rectify data */}
      <section aria-labelledby="gdpr-rectify-heading" className="flex flex-col gap-3">
        <h2 id="gdpr-rectify-heading" className="text-base font-semibold text-gray-900">
          Rectify your data
        </h2>
        <p className="text-sm text-gray-600">
          You can update your personal information at any time from your profile page.
        </p>
        <div>
          <Link
            href="/profile"
            data-testid="gdpr-rectify-link"
            className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded"
          >
            Go to my profile
          </Link>
        </div>
      </section>
    </div>
  )
}
