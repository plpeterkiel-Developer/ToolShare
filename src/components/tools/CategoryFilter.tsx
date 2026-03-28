'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { useTranslations } from 'next-intl'

export interface CategoryFilterProps {
  categories: string[]
  selectedCategory?: string
}

const CATEGORY_KEY_MAP: Record<string, string> = {
  'Power Tools': 'powerTools',
  'Hand Tools': 'handTools',
  Gardening: 'gardening',
  Measuring: 'measuring',
  Cleaning: 'cleaning',
  Automotive: 'automotive',
  Other: 'other',
}

export function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const t = useTranslations('common')
  const tCat = useTranslations('tools.categories')

  function selectCategory(category: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    params.delete('page')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const allActive = !selectedCategory

  return (
    <div
      role="group"
      aria-label="Filter by category"
      data-testid="category-filter"
      className="flex flex-wrap gap-2"
    >
      <button
        type="button"
        aria-pressed={allActive}
        data-testid="category-all"
        onClick={() => selectCategory(null)}
        className={[
          'rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2',
          allActive
            ? 'bg-green-800 text-white'
            : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:border-stone-300',
        ].join(' ')}
      >
        {t('all')}
      </button>

      {categories.map((category) => {
        const isActive = category === selectedCategory
        return (
          <button
            key={category}
            type="button"
            aria-pressed={isActive}
            data-testid={`category-${category}`}
            onClick={() => selectCategory(category)}
            className={[
              'rounded-full px-3 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
              isActive
                ? 'bg-green-600 text-white'
                : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50',
            ].join(' ')}
          >
            {CATEGORY_KEY_MAP[category] ? tCat(CATEGORY_KEY_MAP[category]) : category}
          </button>
        )
      })}
    </div>
  )
}
