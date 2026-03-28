'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { updateProfile } from '@/lib/actions/profile'
import type { Profile } from '@/types/database.types'
import type { LatLng } from '@/components/ui/LocationPicker'

const LocationPicker = dynamic(
  () => import('@/components/ui/LocationPicker').then((m) => m.LocationPicker),
  { ssr: false }
)

const RADIUS_OPTIONS = [1, 2, 5, 10, 25, 50] as const

export interface ProfileFormProps {
  profile: Pick<Profile, 'display_name' | 'location' | 'latitude' | 'longitude' | 'search_radius' | 'pickup_address' | 'bio' | 'avatar_url'>
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState(false)
  const [pin, setPin] = useState<LatLng | null>(
    profile.latitude != null && profile.longitude != null
      ? { lat: profile.latitude, lng: profile.longitude }
      : null
  )
  const [searchRadius, setSearchRadius] = useState(profile.search_radius ?? 2)
  const t = useTranslations('profile')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setSuccess(false)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    // Inject coordinates and radius from component state
    if (pin) {
      formData.set('latitude', String(pin.lat))
      formData.set('longitude', String(pin.lng))
    } else {
      formData.delete('latitude')
      formData.delete('longitude')
    }
    formData.set('search_radius', String(searchRadius))
    const result = await updateProfile(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5"
      data-testid="profile-form"
    >
      {error && (
        <div
          role="alert"
          data-testid="profile-form-error"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          data-testid="profile-form-success"
          className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {t('saved')}
        </div>
      )}

      <Input
        id="display-name"
        name="display_name"
        type="text"
        label={t('form.displayName')}
        required
        defaultValue={profile.display_name}
        data-testid="display-name-input"
      />

      <Input
        id="location"
        name="location"
        type="text"
        label={t('form.location')}
        defaultValue={profile.location ?? ''}
        data-testid="location-input"
      />

      {/* Map pin for location coordinates */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          {t('form.mapLocation')}
        </label>
        <p className="mb-2 text-xs text-gray-500">{t('form.mapLocationHint')}</p>
        <LocationPicker value={pin} onChange={setPin} radiusKm={searchRadius} height="250px" />
        {pin && (
          <button
            type="button"
            onClick={() => setPin(null)}
            data-testid="clear-map-pin"
            className="mt-2 text-xs text-gray-500 hover:text-red-600 underline"
          >
            {t('form.clearPin')}
          </button>
        )}

        <div className="mt-3">
          <label htmlFor="search-radius" className="mb-1 block text-sm font-medium text-gray-700">
            {t('form.searchRadius')}
          </label>
          <p className="mb-1.5 text-xs text-gray-500">{t('form.searchRadiusHint')}</p>
          <select
            id="search-radius"
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            data-testid="search-radius-select"
            className="rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        id="pickup-address"
        name="pickup_address"
        type="text"
        label={t('form.pickupAddress')}
        defaultValue={profile.pickup_address ?? ''}
        data-testid="pickup-address-input"
      />

      <Textarea
        id="bio"
        name="bio"
        label={t('form.bio')}
        rows={4}
        defaultValue={profile.bio ?? ''}
        data-testid="bio-input"
      />

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        data-testid="save-profile-button"
        className="w-full sm:w-auto"
      >
        {t('form.save')}
      </Button>
    </form>
  )
}
