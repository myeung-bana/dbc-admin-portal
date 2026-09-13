import { updateSessionAction } from '@/app/actions/admin'
import { SessionForm } from '@/components/session-form'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getSession, listSessionBookings } from '@/lib/data/sessions'
import { listCourts, listLocations } from '@/lib/data/master-data'
import { formatSessionTimeRange, formatSessionVenue } from '@/lib/sessions/format'
import { redirect } from 'next/navigation'

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

  if (sessionId === 'create' || sessionId === 'new') {
    redirect('/dashboard/sessions/create')
  }

  const [sessionResult, bookingsResult, locationsResult, courtsResult] = await Promise.all([
    getSession(sessionId),
    listSessionBookings(sessionId),
    listLocations(),
    listCourts(),
  ])

  const session = sessionResult.ok ? sessionResult.data.sessions_by_pk : null
  if (!session) redirect('/dashboard/sessions')

  const bookings = bookingsResult.ok ? bookingsResult.data.session_bookings : []
  const locations = locationsResult.ok ? locationsResult.data.master_locations : []
  const courts = courtsResult.ok ? courtsResult.data.master_courts : []
  const confirmed = bookings.filter((booking) => booking.status === 'confirmed')
  const waitlisted = bookings.filter((booking) => booking.status === 'waitlisted')
  const updateSession = updateSessionAction.bind(null, sessionId)

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{session.title}</h2>
        <p className="text-muted-foreground">
          {formatSessionTimeRange(session)} · {formatSessionVenue(session)} · capacity{' '}
          {session.capacity}
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Edit session</CardTitle>
          </CardHeader>
          <CardContent>
            <SessionForm
              action={updateSession}
              locations={locations}
              courts={courts}
              session={session}
              submitLabel="Save changes"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Roster (view only)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 font-medium">Confirmed ({confirmed.length})</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {confirmed.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-muted-foreground">
                        No confirmed attendees yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    confirmed.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.user?.displayName ?? '—'}</TableCell>
                        <TableCell>{booking.user?.email ?? '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Waitlist ({waitlisted.length})</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitlisted.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-muted-foreground">
                        No waitlisted players.
                      </TableCell>
                    </TableRow>
                  ) : (
                    waitlisted.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.user?.displayName ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{booking.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
