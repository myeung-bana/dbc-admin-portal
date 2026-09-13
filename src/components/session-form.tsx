'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  combineLocalDateTime,
  toLocalDateInput,
  toLocalTimeInput,
} from '@/lib/sessions/format'
import type { MasterCourt, MasterLocation, Session } from '@/lib/types'

type SessionFormProps = {
  action: (formData: FormData) => void | Promise<void>
  locations: MasterLocation[]
  courts: MasterCourt[]
  session?: Session
  submitLabel?: string
}

const selectClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50'

export function SessionForm({
  action,
  locations,
  courts,
  session,
  submitLabel = 'Save session',
}: SessionFormProps) {
  const initialLocationId =
    session?.location?.id ?? session?.court?.location?.id ?? ''
  const initialCourtId = session?.court?.id ?? ''

  const [locationId, setLocationId] = useState(initialLocationId)
  const [courtId, setCourtId] = useState(initialCourtId)
  const [sessionDate, setSessionDate] = useState(
    session ? toLocalDateInput(session.starts_at) : '',
  )
  const [startTime, setStartTime] = useState(
    session ? toLocalTimeInput(session.starts_at) : '',
  )
  const [endTime, setEndTime] = useState(session ? toLocalTimeInput(session.ends_at) : '')

  const filteredCourts = useMemo(
    () => courts.filter((court) => court.location?.id === locationId),
    [courts, locationId],
  )

  const startsAt =
    sessionDate && startTime ? combineLocalDateTime(sessionDate, startTime) : ''
  const endsAt = sessionDate && endTime ? combineLocalDateTime(sessionDate, endTime) : ''

  function handleLocationChange(nextLocationId: string) {
    setLocationId(nextLocationId)
    const stillValid = courts.some(
      (court) => court.id === courtId && court.location?.id === nextLocationId,
    )
    if (!stillValid) {
      setCourtId('')
    }
  }

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={session?.title ?? ''} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sessionDate">Date</Label>
        <Input
          id="sessionDate"
          type="date"
          value={sessionDate}
          onChange={(event) => setSessionDate(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity</Label>
        <Input
          id="capacity"
          name="capacity"
          type="number"
          defaultValue={session?.capacity ?? 15}
          min={1}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startTime">Start time</Label>
        <Input
          id="startTime"
          type="time"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endTime">End time</Label>
        <Input
          id="endTime"
          type="time"
          value={endTime}
          onChange={(event) => setEndTime(event.target.value)}
          required
        />
      </div>

      <input type="hidden" name="startsAt" value={startsAt} />
      <input type="hidden" name="endsAt" value={endsAt} />

      <div className="space-y-2">
        <Label htmlFor="locationId">Location</Label>
        <select
          id="locationId"
          name="locationId"
          value={locationId}
          onChange={(event) => handleLocationChange(event.target.value)}
          className={selectClassName}
        >
          <option value="">Select location</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="courtId">Court</Label>
        <select
          id="courtId"
          name="courtId"
          value={courtId}
          onChange={(event) => setCourtId(event.target.value)}
          disabled={!locationId}
          className={selectClassName}
        >
          <option value="">
            {locationId ? 'Select court' : 'Select a location first'}
          </option>
          {filteredCourts.map((court) => (
            <option key={court.id} value={court.id}>
              {court.name} · {court.location?.name ?? 'Unknown location'}
            </option>
          ))}
        </select>
      </div>

      {session ? (
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={session.status}
            className={selectClassName}
          >
            <option value="scheduled">scheduled</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
      ) : (
        <input type="hidden" name="status" value="scheduled" />
      )}

      <div className="md:col-span-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
