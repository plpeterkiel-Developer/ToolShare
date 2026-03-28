'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/Spinner'

export interface ToolImageUploadProps {
  currentUrl?: string | null
  onUpload: (url: string) => void
}

export function ToolImageUpload({ currentUrl, onUpload }: ToolImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('tools.image')

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
    if (file.size > MAX_SIZE) {
      setError(t('tooLarge'))
      return
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      setError(t('unsupported'))
      return
    }

    setError(null)
    setUploading(true)

    // Local preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    try {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        setError(t('loginRequired'))
        setUploading(false)
        return
      }

      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${userData.user.id}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('tool-images')
        .upload(path, file, { upsert: false })

      if (uploadError) {
        setError(uploadError.message)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('tool-images').getPublicUrl(path)
      onUpload(urlData.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('uploadFailed'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-gray-700">{t('label')}</span>

      {/* Preview area */}
      <div className="relative h-48 w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
        {preview ? (
          <Image
            src={preview}
            alt={t('label')}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">{t('noImage')}</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Spinner size="md" />
          </div>
        )}
      </div>

      {/* File input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        id="tool-image-file"
        aria-label={t('chooseImage')}
        data-testid="tool-image-input"
        onChange={handleChange}
        disabled={uploading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        data-testid="tool-image-upload-button"
        aria-label={t('chooseImage')}
        className={[
          'inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700',
          'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
        ].join(' ')}
      >
        {uploading ? <Spinner size="sm" /> : null}
        {uploading ? t('uploading') : preview ? t('changeImage') : t('chooseImage')}
      </button>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
