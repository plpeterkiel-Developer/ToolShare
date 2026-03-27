'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { updateProfile } from '@/lib/actions/profile'
import type { Profile } from '@/types/database.types'

export interface ProfileFormProps {
  profile: Pick<Profile, 'display_name' | 'location' | 'pickup_address' | 'bio' | 'avatar_url'>
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setSuccess(false)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
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
          Profile saved!
        </div>
      )}

      <Input
        id="display-name"
        name="display_name"
        type="text"
        label="Display Name"
        required
        defaultValue={profile.display_name}
        data-testid="display-name-input"
      />

      <Input
        id="location"
        name="location"
        type="text"
        label="City / Neighbourhood"
        defaultValue={profile.location ?? ''}
        data-testid="location-input"
      />

      <Input
        id="pickup-address"
        name="pickup_address"
        type="text"
        label="Pick-up Address (private)"
        defaultValue={profile.pickup_address ?? ''}
        data-testid="pickup-address-input"
      />

      <Textarea
        id="bio"
        name="bio"
        label="About Me"
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
        Save Profile
      </Button>
    </form>
  )
}
