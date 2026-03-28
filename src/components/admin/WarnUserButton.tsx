'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { warnUser } from '@/lib/actions/admin'

interface WarnUserButtonProps {
  userId: string
}

export function WarnUserButton({ userId }: WarnUserButtonProps) {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('admin.users')

  async function handleClick() {
    setLoading(true)
    await warnUser(userId)
    setLoading(false)
  }

  return (
    <Button variant="secondary" size="sm" loading={loading} onClick={handleClick}>
      {t('warn')}
    </Button>
  )
}
