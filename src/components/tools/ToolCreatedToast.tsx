'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useToast } from '@/components/ui/Toast'

export function ToolCreatedToast() {
  const { addToast } = useToast()
  const router = useRouter()
  const t = useTranslations('tools')

  useEffect(() => {
    addToast('success', t('createdSuccess'))
    // Remove the query param without triggering a navigation
    router.replace(window.location.pathname, { scroll: false })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
