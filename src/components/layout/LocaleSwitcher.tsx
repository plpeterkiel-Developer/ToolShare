'use client'

import { usePathname, useRouter } from 'next/navigation'
import { routing } from '@/i18n/routing'

type Locale = (typeof routing.locales)[number]

export function LocaleSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(targetLocale: Locale) {
    // Pathname always starts with "/<locale>/..." because localePrefix = 'always'
    const segments = pathname.split('/')
    // segments[0] = '', segments[1] = current locale
    segments[1] = targetLocale
    router.push(segments.join('/'))
  }

  // Derive current locale from pathname
  const currentLocale = (routing.locales as readonly string[]).find(
    (l) =>
      pathname.startsWith(`/${l}`) &&
      (pathname.length === l.length + 1 || pathname[l.length + 1] === '/')
  ) as Locale | undefined

  return (
    <div
      role="group"
      aria-label="Choose language"
      data-testid="locale-switcher"
      className="flex items-center gap-1"
    >
      {(routing.locales as readonly Locale[]).map((locale, idx) => {
        const isActive = locale === currentLocale
        return (
          <React.Fragment key={locale}>
            {idx > 0 && (
              <span aria-hidden="true" className="text-gray-300 text-sm select-none">
                /
              </span>
            )}
            <button
              type="button"
              aria-label={`Switch to ${locale.toUpperCase()}`}
              aria-pressed={isActive}
              data-testid={`locale-${locale}`}
              onClick={() => switchLocale(locale)}
              className={[
                'rounded px-1 py-0.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
                isActive ? 'text-green-700 font-semibold' : 'text-gray-500 hover:text-gray-900',
              ].join(' ')}
            >
              {locale.toUpperCase()}
            </button>
          </React.Fragment>
        )
      })}
    </div>
  )
}

// Need React for Fragment
import React from 'react'
