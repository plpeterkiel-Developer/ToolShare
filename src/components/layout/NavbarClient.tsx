'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher'
import { LogoutButton } from '@/components/layout/LogoutButton'

interface NavbarClientProps {
  user: User | null
  locale: string
  isAdmin?: boolean
}

export function NavbarClient({ user, locale, isAdmin }: NavbarClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const t = useTranslations('nav')

  const navLinks = user
    ? [
        { href: `/${locale}/tools`, label: t('tools') },
        { href: `/${locale}/requests`, label: t('requests') },
        { href: `/${locale}/profile`, label: t('profile') },
        ...(isAdmin ? [{ href: `/${locale}/admin`, label: t('admin') }] : []),
      ]
    : [
        { href: `/${locale}/auth/login`, label: t('login') },
        { href: `/${locale}/auth/signup`, label: t('signup') },
      ]

  return (
    <>
      {/* Desktop links */}
      <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded"
          >
            {link.label}
          </Link>
        ))}
        {user && (
          <>
            <span
              data-testid="nav-profile-name"
              className="text-sm text-gray-500"
              aria-label={`Logged in as ${user.email ?? 'user'}`}
            >
              {user.email}
            </span>
            <LogoutButton />
          </>
        )}
      </nav>

      {/* Mobile hamburger */}
      <button
        type="button"
        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav"
        data-testid="mobile-menu-toggle"
        onClick={() => setMobileOpen((prev) => !prev)}
        className="md:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
      >
        {mobileOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-16 z-30 border-b border-gray-200 bg-white px-4 pb-4 pt-2 shadow-md md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <div className="mt-2 border-t border-gray-100 pt-2 flex flex-col gap-2">
                <span data-testid="nav-profile-name" className="px-3 py-1 text-sm text-gray-500">
                  {user.email}
                </span>
                <LogoutButton />
              </div>
            )}
            <div className="mt-2 border-t border-gray-100 pt-2 px-3">
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
