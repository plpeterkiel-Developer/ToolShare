'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher'
import { LogoutButton } from '@/components/layout/LogoutButton'
import { ToolShareIcon } from '@/components/ui/ToolShareIcon'

interface SidebarClientProps {
  user: User | null
  locale: string
  isAdmin?: boolean
  pendingIncomingCount: number
  activeBorrowsCount: number
}

function ToolsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085"
      />
    </svg>
  )
}

function RequestsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3"
      />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  )
}

function AdminIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  )
}

function LoginIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
      />
    </svg>
  )
}

function SignupIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
      />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
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
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  expanded: boolean
  isActive: boolean
  badge?: number
  badgeColor?: 'red' | 'green'
  onClick?: () => void
}

function NavItem({
  href,
  icon,
  label,
  expanded,
  isActive,
  badge,
  badgeColor = 'red',
  onClick,
}: NavItemProps) {
  const badgeClasses = badgeColor === 'red' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'

  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        title={expanded ? undefined : label}
        className={[
          'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2',
          isActive
            ? 'bg-green-100 text-green-800 font-medium'
            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
        ].join(' ')}
        aria-current={isActive ? 'page' : undefined}
      >
        {icon}
        {expanded && <span className="whitespace-nowrap">{label}</span>}
        {badge !== undefined && badge > 0 && (
          <span
            className={[
              'inline-flex items-center justify-center rounded-full text-xs font-bold',
              expanded ? 'ml-auto px-2 py-0.5 min-w-[1.25rem]' : 'absolute -top-1 -right-1 h-5 w-5',
              badgeClasses,
            ].join(' ')}
            data-testid={badgeColor === 'red' ? 'sidebar-pending-badge' : 'sidebar-active-badge'}
          >
            {badge}
          </span>
        )}
      </Link>
    </li>
  )
}

export function SidebarClient({
  user,
  locale,
  isAdmin,
  pendingIncomingCount,
  activeBorrowsCount,
}: SidebarClientProps) {
  const [expanded, setExpanded] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('nav')
  const sidebarRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setExpanded(false)
    toggleRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && expanded) {
        close()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [expanded, close])

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  const authNavLinks = [
    { href: `/${locale}`, icon: <HomeIcon />, label: t('home'), exact: true },
    { href: `/${locale}/tools`, icon: <ToolsIcon />, label: t('tools') },
    {
      href: `/${locale}/requests`,
      icon: <RequestsIcon />,
      label: t('requests'),
      badge: pendingIncomingCount,
      badgeColor: 'red' as const,
    },
    { href: `/${locale}/profile`, icon: <ProfileIcon />, label: t('profile') },
    ...(isAdmin ? [{ href: `/${locale}/admin`, icon: <AdminIcon />, label: t('admin') }] : []),
  ]

  const guestNavLinks = [
    { href: `/${locale}`, icon: <HomeIcon />, label: t('home'), exact: true },
    { href: `/${locale}/auth/login`, icon: <LoginIcon />, label: t('login') },
    { href: `/${locale}/auth/signup`, icon: <SignupIcon />, label: t('signup') },
  ]

  const navLinks = user ? authNavLinks : guestNavLinks

  return (
    <>
      {/* Mobile toggle button — fixed top-left */}
      <button
        ref={toggleRef}
        type="button"
        data-testid="sidebar-toggle"
        aria-label={expanded ? t('closeSidebar') : t('expandSidebar')}
        aria-expanded={expanded}
        aria-controls="sidebar-nav"
        onClick={() => setExpanded((prev) => !prev)}
        className="fixed left-3 top-3 z-50 rounded-xl bg-white p-2 text-stone-600 shadow-md hover:bg-stone-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 md:hidden"
      >
        {expanded ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Mobile backdrop */}
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden"
          aria-hidden="true"
          onClick={close}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        ref={sidebarRef}
        id="sidebar-nav"
        role="complementary"
        aria-label={t('navigation')}
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform duration-300 ease-in-out md:hidden',
          expanded ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <SidebarContent
          expanded={true}
          user={user}
          locale={locale}
          navLinks={navLinks}
          activeBorrowsCount={activeBorrowsCount}
          isActive={isActive}
          onNavClick={close}
          t={t}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside
        role="complementary"
        aria-label={t('navigation')}
        className={[
          'hidden md:flex flex-col shrink-0 border-r border-stone-200 bg-white sticky top-0 h-screen overflow-y-auto overflow-x-hidden transition-[width] duration-300 ease-in-out',
          expanded ? 'w-64' : 'w-16',
        ].join(' ')}
      >
        {/* Desktop toggle */}
        <div className="flex items-center justify-center py-3">
          <button
            type="button"
            data-testid="sidebar-toggle-desktop"
            aria-label={expanded ? t('collapseSidebar') : t('expandSidebar')}
            aria-expanded={expanded}
            aria-controls="sidebar-nav"
            onClick={() => setExpanded((prev) => !prev)}
            className="rounded-xl p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            {expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </button>
        </div>

        <SidebarContent
          expanded={expanded}
          user={user}
          locale={locale}
          navLinks={navLinks}
          activeBorrowsCount={activeBorrowsCount}
          isActive={isActive}
          t={t}
        />
      </aside>
    </>
  )
}

interface SidebarContentProps {
  expanded: boolean
  user: User | null
  locale: string
  navLinks: Array<{
    href: string
    icon: React.ReactNode
    label: string
    exact?: boolean
    badge?: number
    badgeColor?: 'red' | 'green'
  }>
  activeBorrowsCount: number
  isActive: (href: string, exact?: boolean) => boolean
  onNavClick?: () => void
  t: ReturnType<typeof useTranslations<'nav'>>
}

function SidebarContent({
  expanded,
  user,
  locale,
  navLinks,
  activeBorrowsCount,
  isActive,
  onNavClick,
  t,
}: SidebarContentProps) {
  return (
    <>
      {/* Logo */}
      <div
        className={[
          'flex items-center border-b border-stone-200 px-3 py-4',
          expanded ? 'justify-start gap-3' : 'justify-center',
        ].join(' ')}
      >
        <Link
          href={`/${locale}`}
          onClick={onNavClick}
          className="flex items-center gap-2 text-lg font-bold text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 rounded-xl shrink-0"
        >
          <ToolShareIcon size={28} />
          {expanded && <span>ToolShare</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 px-2 py-3">
        <ul data-testid="sidebar-nav-list" className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              expanded={expanded}
              isActive={isActive(link.href, link.exact)}
              badge={link.badge}
              badgeColor={link.badgeColor}
              onClick={onNavClick}
            />
          ))}
        </ul>

        {/* Active borrows summary */}
        {user && activeBorrowsCount > 0 && expanded && (
          <div className="mt-4 mx-1 rounded-xl bg-sky-50 px-3 py-2.5">
            <Link
              href={`/${locale}/requests`}
              onClick={onNavClick}
              className="flex items-center gap-2 text-sm text-sky-700 hover:text-sky-900 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 rounded-xl"
            >
              <span
                className="inline-flex items-center justify-center rounded-full bg-sky-500 text-white text-xs font-bold h-5 w-5 shrink-0"
                data-testid="sidebar-active-badge"
              >
                {activeBorrowsCount}
              </span>
              <span>{t('activeBorrows', { count: activeBorrowsCount })}</span>
            </Link>
          </div>
        )}

        {/* Active borrows dot when collapsed */}
        {user && activeBorrowsCount > 0 && !expanded && (
          <div className="mt-3 flex justify-center">
            <Link
              href={`/${locale}/requests`}
              onClick={onNavClick}
              title={t('activeBorrows', { count: activeBorrowsCount })}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 text-white text-xs font-bold h-6 w-6 hover:bg-sky-600 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
              data-testid="sidebar-active-badge"
            >
              {activeBorrowsCount}
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom section */}
      <div
        className={[
          'border-t border-stone-200 px-2 py-3',
          expanded ? '' : 'flex flex-col items-center gap-2',
        ].join(' ')}
      >
        {user && expanded && (
          <div className="mb-2 px-3">
            <span
              data-testid="nav-profile-name"
              className="block truncate text-sm text-stone-500"
              aria-label={`Logged in as ${user.email ?? 'user'}`}
            >
              {user.email}
            </span>
          </div>
        )}
        <div
          className={
            expanded
              ? 'flex items-center justify-between px-3 gap-2'
              : 'flex flex-col items-center gap-2'
          }
        >
          <LocaleSwitcher />
          {user && <LogoutButton />}
        </div>
      </div>
    </>
  )
}
