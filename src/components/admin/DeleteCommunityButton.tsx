'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { deleteCommunity } from '@/lib/actions/admin'

interface DeleteCommunityButtonProps {
  communityId: string
}

export function DeleteCommunityButton({ communityId }: DeleteCommunityButtonProps) {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('admin.communities')

  async function handleClick() {
    if (!confirm(t('confirmDelete'))) return
    setLoading(true)
    await deleteCommunity(communityId)
    setLoading(false)
  }

  return (
    <Button variant="danger" size="sm" loading={loading} onClick={handleClick}>
      {t('delete')}
    </Button>
  )
}
