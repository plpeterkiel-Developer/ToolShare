import type { User } from '@supabase/supabase-js'
import { getTranslations } from 'next-intl/server'
import { isCurrentUserAdmin } from '@/lib/admin'
import { getRequestCounts } from '@/lib/queries/requestCounts'
import { SidebarClient } from '@/components/layout/SidebarClient'

export interface SidebarProps {
  user: User | null
  locale: string
}

export async function Sidebar({ user, locale }: SidebarProps) {
  const t = await getTranslations('nav')
  const admin = user ? await isCurrentUserAdmin() : false
  const counts = user ? await getRequestCounts(user.id) : { pendingIncoming: 0, activeBorrows: 0 }

  return (
    <>
      {/* Skip navigation – first focusable element */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-green-700 focus:shadow focus:ring-2 focus:ring-green-500"
      >
        {t('skipToContent')}
      </a>

      <SidebarClient
        user={user}
        locale={locale}
        isAdmin={admin}
        pendingIncomingCount={counts.pendingIncoming}
        activeBorrowsCount={counts.activeBorrows}
      />
    </>
  )
}

export default Sidebar
