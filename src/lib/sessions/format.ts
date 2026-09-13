import type { Session } from '@/lib/types'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function toLocalDateInput(iso: string) {
  const date = new Date(iso)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function toLocalTimeInput(iso: string) {
  const date = new Date(iso)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function combineLocalDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`).toISOString()
}

export function formatSessionTimeRange(
  session: Pick<Session, 'starts_at'> & { ends_at?: string | null },
) {
  const start = new Date(session.starts_at)
  if (!session.ends_at) {
    return start.toLocaleString()
  }

  const end = new Date(session.ends_at)
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()

  const dateLabel = start.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const startTime = start.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
  const endTime = end.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  if (sameDay) {
    return `${dateLabel} · ${startTime} – ${endTime}`
  }

  return `${start.toLocaleString()} – ${end.toLocaleString()}`
}

export function formatSessionVenue(session: Pick<Session, 'court' | 'location'>) {
  const courtName = session.court?.name
  const locationName = session.location?.name ?? session.court?.location?.name

  if (courtName && locationName) {
    return `${courtName} · ${locationName}`
  }

  if (courtName) return courtName
  if (locationName) return locationName
  return '—'
}
