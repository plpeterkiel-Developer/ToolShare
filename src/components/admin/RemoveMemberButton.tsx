'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { removeCommunityMember } from '@/lib/actions/admin'

interface RemoveMemberButtonProps {
  communityId: string
  profileId: string
}

export function RemoveMemberButton({ communityId, profileId }: RemoveMemberButtonProps) {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('admin.communities')

  async function handleClick() {
    setLoading(true)
    await removeCommunityMember(communityId, profileId)
    setLoading(false)
  }

  return (
    <Button variant="danger" size="sm" loading={loading} onClick={handleClick}>
      {t('removeMember')}
    </Button>
  )
}
