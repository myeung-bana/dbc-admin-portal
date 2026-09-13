import { updateSessionAction } from '@/app/actions/admin'
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
import { getSession, listSessionBookings } from '@/lib/data/sessions'
import { listCourts, listLocations } from '@/lib/data/master-data'
import { redirect } from 'next/navigation'

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const [sessionResult, bookingsResult, locationsResult, courtsResult] = await Promise.all([
    getSession(sessionId),
    listSessionBookings(sessionId),
    listLocations(),
    listCourts(),
  ])

  const session = sessionResult.ok ? sessionResult.data.sessions_by_pk : null
  if (!session) redirect('/sessions')

  const bookings = bookingsResult.ok ? bookingsResult.data.session_bookings : []
  const locations = locationsResult.ok ? locationsResult.data.master_locations : []
  const courts = courtsResult.ok ? courtsResult.data.master_courts : []
  const confirmed = bookings.filter((booking) => booking.status === 'confirmed')
  const waitlisted = bookings.filter((booking) => booking.status === 'waitlisted')

  const updateSession = updateSessionAction.bind(null, sessionId)
  const startsAtLocal = new Date(session.starts_at).toISOString().slice(0, 16)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{session.title}</h2>
        <p className="text-muted-foreground">
          {new Date(session.starts_at).toLocaleString()} · capacity {session.capacity}
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Edit session</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateSession} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={session.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startsAt">Start time</Label>
                <Input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={startsAtLocal}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  defaultValue={session.capacity}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationId">Location</Label>
                <select
                  id="locationId"
                  name="locationId"
                  defaultValue={session.location?.id ?? ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">None</option>
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
                  defaultValue={session.court?.id ?? ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {courts.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={session.status}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="scheduled">scheduled</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
              <Button type="submit">Save changes</Button>
            </form>
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
