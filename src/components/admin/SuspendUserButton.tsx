'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { suspendUser, unsuspendUser } from '@/lib/actions/admin'

interface SuspendUserButtonProps {
  userId: string
  isSuspended: boolean
}

export function SuspendUserButton({ userId, isSuspended }: SuspendUserButtonProps) {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('admin.users')

  async function handleClick() {
    setLoading(true)
    const action = isSuspended ? unsuspendUser : suspendUser
    await action(userId)
    setLoading(false)
  }

  return (
    <Button
      variant={isSuspended ? 'secondary' : 'danger'}
      size="sm"
      loading={loading}
      onClick={handleClick}
    >
      {isSuspended ? t('unsuspend') : t('suspend')}
    </Button>
  )
}
