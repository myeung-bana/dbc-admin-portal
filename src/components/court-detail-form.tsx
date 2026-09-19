'use client'

import { useEffect, useState } from 'react'
import { updateCourtAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useActionForm } from '@/hooks/use-action-form'
import type { MasterCourt, MasterLocation } from '@/lib/types'

type CourtDetailFormProps = {
  court: MasterCourt
  locations: MasterLocation[]
}

export function CourtDetailForm({ court, locations }: CourtDetailFormProps) {
  const [name, setName] = useState(court.name)
  const [locationId, setLocationId] = useState(court.location?.id ?? '')
  const { onSubmit, pending } = useActionForm(
    updateCourtAction.bind(null, court.id),
    {
      successMessage: 'Court saved',
      errorMessage: 'Could not save court',
    },
  )

  useEffect(() => {
    setName(court.name)
    setLocationId(court.location?.id ?? '')
  }, [court.id, court.name, court.location?.id])

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locationId">Location</Label>
            <Select
              value={locationId}
              onValueChange={(value) => value && setLocationId(value)}
            >
              <SelectTrigger id="locationId" className="w-full">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                    {location.country?.name ? ` (${location.country.name})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="locationId" value={locationId} />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
