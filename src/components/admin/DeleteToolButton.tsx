'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { adminDeleteTool } from '@/lib/actions/admin'

interface DeleteToolButtonProps {
  toolId: string
}

export function DeleteToolButton({ toolId }: DeleteToolButtonProps) {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('admin.tools')

  async function handleClick() {
    if (!confirm(t('confirmDelete'))) return
    setLoading(true)
    await adminDeleteTool(toolId)
    setLoading(false)
  }

  return (
    <Button variant="danger" size="sm" loading={loading} onClick={handleClick}>
      {t('delete')}
    </Button>
  )
}
