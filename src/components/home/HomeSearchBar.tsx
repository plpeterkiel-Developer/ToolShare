'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface HomeSearchBarProps {
  locale: string
}

export function HomeSearchBar({ locale }: HomeSearchBarProps) {
  const [value, setValue] = useState('')
  const router = useRouter()
  const t = useTranslations('home')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) {
      router.push(`/${locale}/tools?q=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 transition-colors"
      />
      <button
        type="submit"
        className="rounded-xl bg-green-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-800 focus-visible:ring-offset-2 transition-colors"
      >
        {t('searchButton')}
      </button>
    </form>
  )
}
