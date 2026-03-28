'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import type { LatLng } from '@/components/ui/LocationPicker'

// Leaflet uses `window`, so we must skip SSR
const LocationPicker = dynamic(
  () => import('@/components/ui/LocationPicker').then((m) => m.LocationPicker),
  { ssr: false }
)

const RADIUS_OPTIONS = [1, 2, 5, 10, 25, 50] as const

interface LocationFilterProps {
  defaultLat?: number
  defaultLng?: number
  defaultRadius?: number
}

export function LocationFilter({ defaultLat, defaultLng, defaultRadius }: LocationFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const t = useTranslations('tools.location')

  const [expanded, setExpanded] = useState(!!(defaultLat && defaultLng))
  const [pin, setPin] = useState<LatLng | null>(
    defaultLat != null && defaultLng != null ? { lat: defaultLat, lng: defaultLng } : null
  )
  const [radius, setRadius] = useState(defaultRadius ?? 10)

  const applyFilter = useCallback(
    (newPin: LatLng | null, newRadius: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (newPin) {
        params.set('lat', newPin.lat.toFixed(6))
        params.set('lng', newPin.lng.toFixed(6))
        params.set('radius', String(newRadius))
      } else {
        params.delete('lat')
        params.delete('lng')
        params.delete('radius')
      }
      params.delete('page')
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [searchParams, pathname, router, startTransition]
  )

  function handlePinChange(latlng: LatLng) {
    setPin(latlng)
    applyFilter(latlng, radius)
  }

  function handleRadiusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRadius = Number(e.target.value)
    setRadius(newRadius)
    if (pin) {
      applyFilter(pin, newRadius)
    }
  }

  function handleClear() {
    setPin(null)
    applyFilter(null, radius)
  }

  return (
    <div className="flex flex-col gap-3" data-testid="location-filter">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-green-700 transition-colors"
        aria-expanded={expanded}
        data-testid="location-filter-toggle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {t('filterByLocation')}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-500">{t('clickToDropPin')}</p>

          <LocationPicker value={pin} onChange={handlePinChange} radiusKm={radius} height="250px" />

          <div className="flex items-center gap-3">
            <label htmlFor="radius-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {t('radius')}
            </label>
            <select
              id="radius-select"
              value={radius}
              onChange={handleRadiusChange}
              data-testid="radius-select"
              className="rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r} km
                </option>
              ))}
            </select>

            {pin && (
              <button
                type="button"
                onClick={handleClear}
                data-testid="location-filter-clear"
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              >
                {t('clearLocation')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
