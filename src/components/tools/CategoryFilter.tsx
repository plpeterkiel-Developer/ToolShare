'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export interface CategoryFilterProps {
  categories: string[]
  selectedCategory?: string
}

export function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

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
          'rounded-full px-3 py-1 text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
          allActive
            ? 'bg-green-600 text-white'
            : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50',
        ].join(' ')}
      >
        All
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
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
              isActive
                ? 'bg-green-600 text-white'
                : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50',
            ].join(' ')}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}
