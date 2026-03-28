import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher'
import { NavbarClient } from '@/components/layout/NavbarClient'
import { isCurrentUserAdmin } from '@/lib/admin'

export interface NavbarProps {
  user: User | null
  locale: string
}

export async function Navbar({ user, locale }: NavbarProps) {
  const t = await getTranslations('nav')
  const admin = user ? await isCurrentUserAdmin() : false

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      {/* Skip navigation – first focusable element */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-green-700 focus:shadow focus:ring-2 focus:ring-green-500"
      >
        {t('skipToContent')}
      </a>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="text-lg font-bold text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded"
        >
          ToolShare
        </Link>

        {/* Desktop nav — rendered by the server, interactive parts delegated to client */}
        <NavbarClient user={user} locale={locale} isAdmin={admin} />

        {/* Locale switcher (always visible on desktop) */}
        <div className="hidden md:block">
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  )
}

export default Navbar
