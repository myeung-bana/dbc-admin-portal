'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { bulkImportSessionsAction } from '@/app/actions/admin'
import { toastActionError, toastActionSuccess } from '@/lib/toast/action-feedback'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CSV_TEMPLATE } from '@/lib/schemas/bulk-session.schema'
import {
  generateRecurringSessions,
  parseCsvSessions,
  type ResolvedBulkSessionRow,
} from '@/lib/sessions/bulk-import'
import { formatSessionTimeRange, formatSessionVenue } from '@/lib/sessions/format'
import type { MasterCourt, MasterLocation, Session } from '@/lib/types'

const DAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

type SessionsImportFormProps = {
  spaceId: string
  locations: MasterLocation[]
  courts: MasterCourt[]
}

function PreviewTable({ rows, locations, courts }: { rows: ResolvedBulkSessionRow[]; locations: MasterLocation[]; courts: MasterCourt[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No sessions to preview yet.</p>
  }

  const validCount = rows.filter((row) => row.rowErrors.length === 0).length

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {validCount} of {rows.length} sessions ready to import.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>When</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={`${row.title}-${row.startsAt}-${index}`}>
              <TableCell className="font-medium">{row.title}</TableCell>
              <TableCell>
                {formatSessionTimeRange({
                  starts_at: row.startsAt,
                  ends_at: row.endsAt,
                } as Session)}
              </TableCell>
              <TableCell>
                {formatSessionVenue({
                  location: row.locationId
                    ? { id: row.locationId, name: locations.find((l) => l.id === row.locationId)?.name ?? '' }
                    : row.locationName
                      ? { id: '', name: row.locationName }
                      : null,
                  court: row.courtId
                    ? {
                        id: row.courtId,
                        name: courts.find((c) => c.id === row.courtId)?.name ?? '',
                        location: courts.find((c) => c.id === row.courtId)?.location ?? null,
                      }
                    : row.courtName
                      ? { id: '', name: row.courtName, location: null }
                      : null,
                })}
              </TableCell>
              <TableCell>{row.capacity}</TableCell>
              <TableCell>
                {row.rowErrors.length === 0 ? (
                  <Badge>ready</Badge>
                ) : (
                  <span className="text-sm text-destructive">{row.rowErrors.join('; ')}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function SessionsImportForm({ spaceId, locations, courts }: SessionsImportFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [csvText, setCsvText] = useState('')
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [previewRows, setPreviewRows] = useState<ResolvedBulkSessionRow[]>([])
  const [recurring, setRecurring] = useState({
    title: '',
    dayOfWeek: 2,
    startTime: '19:00',
    endTime: '21:00',
    startDate: '',
    endDate: '',
    capacity: 15,
    locationId: '',
    courtId: '',
  })

  const importAction = bulkImportSessionsAction.bind(null, spaceId)
  const recurringCourts = useMemo(
    () => courts.filter((court) => court.location?.id === recurring.locationId),
    [courts, recurring.locationId],
  )

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'session-import-template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function validatePreview(payload: string) {
    const result = await importAction(payload, true)
    if (!result.ok) {
      toastActionError(result.error)
      return
    }
    if ('rows' in result) {
      setPreviewRows(result.rows)
    }
  }

  function handleCsvFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      setCsvText(text)
      const parsed = parseCsvSessions(text)
      setCsvErrors(parsed.errors)
      if (parsed.rows.length > 0) {
        startTransition(async () => {
          await validatePreview(JSON.stringify(parsed.rows))
        })
      } else {
        setPreviewRows([])
      }
    }
    reader.readAsText(file)
  }

  function handleGenerateRecurring() {
    const rows = generateRecurringSessions({
      title: recurring.title,
      dayOfWeek: recurring.dayOfWeek,
      startTime: recurring.startTime,
      endTime: recurring.endTime,
      startDate: recurring.startDate,
      endDate: recurring.endDate,
      capacity: recurring.capacity,
      locationId: recurring.locationId,
      courtId: recurring.courtId,
      status: 'scheduled',
    })

    if (rows.length === 0) {
      toastActionError('No sessions generated. Check your dates and day of week.')
      setPreviewRows([])
      return
    }

    const withIds = rows.map((row) => ({
      ...row,
      locationId: recurring.locationId || undefined,
      courtId: recurring.courtId || undefined,
    }))

    startTransition(async () => {
      await validatePreview(JSON.stringify(withIds))
    })
  }

  const canImport = useMemo(
    () => previewRows.some((row) => row.rowErrors.length === 0),
    [previewRows],
  )

  function handleImport() {
    const validRows = previewRows
      .filter((row) => row.rowErrors.length === 0)
      .map(({ title, startsAt, endsAt, capacity, locationId, courtId, status, locationName, courtName }) => ({
        title,
        startsAt,
        endsAt,
        capacity,
        locationId,
        courtId,
        locationName,
        courtName,
        status,
      }))

    startTransition(async () => {
      const result = await importAction(JSON.stringify(validRows), false)
      if (!result.ok) {
        toastActionError(result.error)
        return
      }
      if ('count' in result) {
        toastActionSuccess(`Imported ${result.count} sessions`)
        router.push('/dashboard/sessions')
      }
    })
  }

  return (
    <Tabs defaultValue="csv">
      <TabsList variant="line">
        <TabsTrigger value="csv">CSV import</TabsTrigger>
        <TabsTrigger value="recurring">Recurring schedule</TabsTrigger>
      </TabsList>

      <TabsContent value="csv" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload season CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Columns: title, starts_at, ends_at, capacity, location_name, court_name, status
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={downloadTemplate}>
                Download template
              </Button>
              <Input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) handleCsvFile(file)
                }}
              />
            </div>
            {csvErrors.length > 0 ? (
              <div className="space-y-1 text-sm text-destructive">
                {csvErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            ) : null}
            {csvText ? (
              <pre className="max-h-40 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
                {csvText}
              </pre>
            ) : null}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="recurring" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate recurring sessions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recurring-title">Title</Label>
              <Input
                id="recurring-title"
                value={recurring.title}
                onChange={(event) =>
                  setRecurring((current) => ({ ...current, title: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recurring-day">Day of week</Label>
              <select
                id="recurring-day"
                value={recurring.dayOfWeek}
                onChange={(event) =>
                  setRecurring((current) => ({
                    ...current,
                    dayOfWeek: Number(event.target.value),
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {DAY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recurring-time">Start time</Label>
              <Input
                id="recurring-time"
                type="time"
                value={recurring.startTime}
                onChange={(event) =>
                  setRecurring((current) => ({ ...current, startTime: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recurring-end-time">End time</Label>
              <Input
                id="recurring-end-time"
                type="time"
                value={recurring.endTime}
                onChange={(event) =>
                  setRecurring((current) => ({ ...current, endTime: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recurring-capacity">Capacity</Label>
              <Input
                id="recurring-capacity"
                type="number"
                min={1}
                value={recurring.capacity}
                onChange={(event) =>
                  setRecurring((current) => ({
                    ...current,
                    capacity: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recurring-start">Start date</Label>
              <Input
                id="recurring-start"
                type="date"
                value={recurring.startDate}
                onChange={(event) =>
                  setRecurring((current) => ({ ...current, startDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recurring-end">End date</Label>
              <Input
                id="recurring-end"
                type="date"
                value={recurring.endDate}
                onChange={(event) =>
                  setRecurring((current) => ({ ...current, endDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recurring-location">Location</Label>
              <select
                id="recurring-location"
                value={recurring.locationId}
                onChange={(event) => {
                  const locationId = event.target.value
                  setRecurring((current) => ({
                    ...current,
                    locationId,
                    courtId: courts.some(
                      (court) => court.id === current.courtId && court.location?.id === locationId,
                    )
                      ? current.courtId
                      : '',
                  }))
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              <Label htmlFor="recurring-court">Court</Label>
              <select
                id="recurring-court"
                value={recurring.courtId}
                disabled={!recurring.locationId}
                onChange={(event) =>
                  setRecurring((current) => ({ ...current, courtId: event.target.value }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {recurring.locationId ? 'Select court' : 'Select a location first'}
                </option>
                {recurringCourts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name} · {court.location?.name ?? 'Unknown location'}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <Button type="button" onClick={handleGenerateRecurring} disabled={isPending}>
                Generate preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Preview</CardTitle>
          <Button type="button" onClick={handleImport} disabled={!canImport || isPending}>
            Import {previewRows.filter((row) => row.rowErrors.length === 0).length} sessions
          </Button>
        </CardHeader>
        <CardContent>
          <PreviewTable rows={previewRows} locations={locations} courts={courts} />
        </CardContent>
      </Card>
    </Tabs>
  )
}
