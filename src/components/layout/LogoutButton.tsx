'use client'

import { logout } from '@/lib/actions/auth'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

export function LogoutButton() {
  const [loading, setLoading] = useState(false)

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
        aria-label="Log out"
      >
        Log out
      </Button>
    </form>
  )
}
