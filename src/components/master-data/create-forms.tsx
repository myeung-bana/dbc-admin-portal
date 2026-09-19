'use client'

import Link from 'next/link'
import { createCountryAction, createCourtAction, createLocationAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionForm } from '@/hooks/use-action-form'

export function CreateCountryForm() {
  const { onSubmit, pending } = useActionForm(createCountryAction, {
    successMessage: 'Country created',
    errorMessage: 'Could not create country',
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input id="code" name="code" required maxLength={3} placeholder="SG" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Creating…' : 'Create country'}
        </Button>
        <Button variant="outline" render={<Link href="/master-console/master-data/countries" />}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

type CreateLocationFormProps = {
  countries: Array<{ id: string; name: string }>
  defaultCountryId?: string
}

export function CreateLocationForm({ countries, defaultCountryId = '' }: CreateLocationFormProps) {
  const { onSubmit, pending } = useActionForm(createLocationAction, {
    successMessage: 'Location created',
    errorMessage: 'Could not create location',
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="countryId">Country</Label>
        <select
          id="countryId"
          name="countryId"
          required
          defaultValue={defaultCountryId}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select country</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Creating…' : 'Create location'}
        </Button>
        <Button variant="outline" render={<Link href="/master-console/master-data/locations" />}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

type CreateCourtFormProps = {
  locations: Array<{ id: string; name: string; country?: { name: string } | null }>
  defaultLocationId?: string
}

export function CreateCourtForm({ locations, defaultLocationId = '' }: CreateCourtFormProps) {
  const { onSubmit, pending } = useActionForm(createCourtAction, {
    successMessage: 'Court created',
    errorMessage: 'Could not create court',
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="locationId">Location</Label>
        <select
          id="locationId"
          name="locationId"
          required
          defaultValue={defaultLocationId}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select location</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
              {location.country?.name ? ` (${location.country.name})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Creating…' : 'Create court'}
        </Button>
        <Button variant="outline" render={<Link href="/master-console/master-data/courts" />}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
