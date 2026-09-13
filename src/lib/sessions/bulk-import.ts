import {
  bulkSessionRowSchema,
  type BulkSessionRow,
  type RecurringSessionInput,
} from '@/lib/schemas/bulk-session.schema'
import type { MasterCourt, MasterLocation, Session } from '@/lib/types'

const CSV_COLUMN_MAP: Record<string, keyof BulkSessionRow | 'startsAt' | 'endsAt'> = {
  title: 'title',
  starts_at: 'startsAt',
  start_time: 'startsAt',
  startsat: 'startsAt',
  ends_at: 'endsAt',
  end_time: 'endsAt',
  endsat: 'endsAt',
  capacity: 'capacity',
  location_name: 'locationName',
  location: 'locationName',
  court_name: 'courtName',
  court: 'courtName',
  status: 'status',
}

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/\s+/g, '_')
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}

export function parseCsvSessions(text: string): {
  rows: BulkSessionRow[]
  errors: string[]
} {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length < 2) {
    return { rows: [], errors: ['CSV must include a header row and at least one data row.'] }
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader)
  const errors: string[] = []
  const rows: BulkSessionRow[] = []

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const values = parseCsvLine(lines[lineIndex])
    const raw: Record<string, string> = {}

    headers.forEach((header, index) => {
      const mapped = CSV_COLUMN_MAP[header]
      if (!mapped || !values[index]) return
      raw[mapped] = values[index]
    })

    if (!raw.title && !raw.startsAt) continue

    const parsed = bulkSessionRowSchema.safeParse({
      title: raw.title ?? '',
      startsAt: raw.startsAt ?? '',
      endsAt: raw.endsAt ?? '',
      capacity: raw.capacity || 15,
      locationName: raw.locationName || undefined,
      courtName: raw.courtName || undefined,
      status: raw.status || 'scheduled',
    })

    if (!parsed.success) {
      errors.push(
        `Row ${lineIndex + 1}: ${parsed.error.issues[0]?.message ?? 'Invalid row'}`,
      )
      continue
    }

    if (Number.isNaN(Date.parse(parsed.data.startsAt))) {
      errors.push(`Row ${lineIndex + 1}: Invalid start time "${parsed.data.startsAt}"`)
      continue
    }

    if (Number.isNaN(Date.parse(parsed.data.endsAt))) {
      errors.push(`Row ${lineIndex + 1}: Invalid end time "${parsed.data.endsAt}"`)
      continue
    }

    rows.push(parsed.data)
  }

  return { rows, errors }
}

function normalizeName(value: string) {
  return value.trim().toLowerCase()
}

export type ResolvedBulkSessionRow = BulkSessionRow & {
  locationId?: string
  courtId?: string
  rowErrors: string[]
}

export type BulkSessionRowInput = BulkSessionRow & {
  locationId?: string
  courtId?: string
}

function resolveCourt(
  row: BulkSessionRowInput,
  courts: MasterCourt[],
  locationId?: string,
): { courtId?: string; locationId?: string; error?: string } {
  if (row.courtId) {
    const court = courts.find((item) => item.id === row.courtId)
    if (!court) return { error: 'Unknown court id' }
    if (locationId && court.location?.id && court.location.id !== locationId) {
      return { error: 'Selected court does not belong to the chosen location' }
    }
    return {
      courtId: court.id,
      locationId: locationId ?? court.location?.id,
    }
  }

  if (!row.courtName) {
    return { locationId }
  }

  const matches = courts.filter(
    (court) => normalizeName(court.name) === normalizeName(row.courtName ?? ''),
  )

  if (matches.length === 0) {
    return { locationId, error: `Unknown court "${row.courtName}"` }
  }

  if (locationId) {
    const court = matches.find((item) => item.location?.id === locationId)
    if (!court) {
      return {
        locationId,
        error: `Court "${row.courtName}" does not belong to the selected location`,
      }
    }
    return { courtId: court.id, locationId }
  }

  if (matches.length === 1) {
    return {
      courtId: matches[0].id,
      locationId: matches[0].location?.id,
    }
  }

  return {
    locationId,
    error: `Court "${row.courtName}" is ambiguous; specify location_name`,
  }
}

export function resolveBulkSessionRows(
  rows: BulkSessionRowInput[],
  locations: MasterLocation[],
  courts: MasterCourt[],
  existingSessions: Session[],
): ResolvedBulkSessionRow[] {
  const locationByName = new Map(
    locations.map((location) => [normalizeName(location.name), location]),
  )
  const existingKeys = new Set(
    existingSessions.map(
      (session) =>
        `${session.title.trim().toLowerCase()}|${new Date(session.starts_at).toISOString()}`,
    ),
  )
  const importKeys = new Set<string>()

  return rows.map((row) => {
    const rowErrors: string[] = []
    let locationId: string | undefined

    if (row.locationId) {
      locationId = row.locationId
    } else if (row.locationName) {
      const location = locationByName.get(normalizeName(row.locationName))
      if (!location) {
        rowErrors.push(`Unknown location "${row.locationName}"`)
      } else {
        locationId = location.id
      }
    }

    const courtResult = resolveCourt(row, courts, locationId)
    if (courtResult.error) rowErrors.push(courtResult.error)
    locationId = courtResult.locationId ?? locationId

    const key = `${row.title.trim().toLowerCase()}|${new Date(row.startsAt).toISOString()}`
    if (existingKeys.has(key)) {
      rowErrors.push('Session already exists for this title and start time')
    }
    if (importKeys.has(key)) {
      rowErrors.push('Duplicate row in import file')
    }
    importKeys.add(key)

    return {
      ...row,
      locationId,
      courtId: courtResult.courtId,
      rowErrors,
    }
  })
}

export function generateRecurringSessions(input: RecurringSessionInput): BulkSessionRow[] {
  const rows: BulkSessionRow[] = []
  const [startHours, startMinutes] = input.startTime.split(':').map(Number)
  const [endHours, endMinutes] = input.endTime.split(':').map(Number)
  const start = new Date(`${input.startDate}T00:00:00`)
  const end = new Date(`${input.endDate}T23:59:59`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return rows
  }

  const cursor = new Date(start)
  while (cursor <= end) {
    if (cursor.getDay() === input.dayOfWeek) {
      const startsAt = new Date(cursor)
      startsAt.setHours(startHours, startMinutes, 0, 0)
      const endsAt = new Date(cursor)
      endsAt.setHours(endHours, endMinutes, 0, 0)

      if (startsAt >= start && endsAt > startsAt) {
        rows.push({
          title: input.title,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          capacity: input.capacity,
          status: input.status,
        })
      }
    }

    cursor.setDate(cursor.getDate() + 1)
  }

  return rows
}

export type BulkSessionInsert = {
  space_id: string
  title: string
  starts_at: string
  ends_at: string
  capacity: number
  court_id: string | null
  location_id: string | null
  status: 'scheduled' | 'cancelled'
}

export function toBulkSessionInserts(
  spaceId: string,
  rows: ResolvedBulkSessionRow[],
): BulkSessionInsert[] {
  return rows
    .filter((row) => row.rowErrors.length === 0)
    .map((row) => ({
      space_id: spaceId,
      title: row.title,
      starts_at: new Date(row.startsAt).toISOString(),
      ends_at: new Date(row.endsAt).toISOString(),
      capacity: row.capacity,
      court_id: row.courtId ?? null,
      location_id: row.locationId ?? null,
      status: row.status,
    }))
}
