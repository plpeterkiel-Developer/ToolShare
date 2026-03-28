'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface AdminSidebarProps {
  locale: string
}

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const pathname = usePathname()
  const t = useTranslations('admin.nav')

  const links = [
    { href: `/${locale}/admin`, label: t('dashboard') },
    { href: `/${locale}/admin/users`, label: t('users') },
    { href: `/${locale}/admin/communities`, label: t('communities') },
    { href: `/${locale}/admin/tools`, label: t('tools') },
    { href: `/${locale}/admin/reports`, label: t('reports') },
    { href: `/${locale}/admin/requests`, label: t('requests') },
  ]

  return (
    <nav className="w-full md:w-56 shrink-0" aria-label="Admin navigation">
      <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== `/${locale}/admin` && pathname.startsWith(link.href))
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={[
                  'block whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-green-50 text-green-800 font-medium'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-green-800',
                ].join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
