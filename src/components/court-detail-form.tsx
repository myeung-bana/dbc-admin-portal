'use client'

import { useState } from 'react'
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
import type { MasterCourt, MasterLocation } from '@/lib/types'

type CourtDetailFormProps = {
  court: MasterCourt
  locations: MasterLocation[]
}

export function CourtDetailForm({ court, locations }: CourtDetailFormProps) {
  const updateCourt = updateCourtAction.bind(null, court.id)
  const [locationId, setLocationId] = useState(court.location?.id ?? '')

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={updateCourt} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={court.name} required />
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
          <Button type="submit">Save changes</Button>
        </form>
      </CardContent>
    </Card>
  )
}
