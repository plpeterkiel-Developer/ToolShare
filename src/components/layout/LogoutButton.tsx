'use client'

import { logout } from '@/lib/actions/auth'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('nav')

  async function handleLogout() {
    setLoading(true)
    await logout()
  }

  return (
    <form action={handleLogout}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        loading={loading}
        data-testid="logout-button"
        aria-label={t('logout')}
      >
        {t('logout')}
      </Button>
    </form>
  )
}
