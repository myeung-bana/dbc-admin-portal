import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { requireActiveSpace } from '@/lib/admin-context'
import { listSessions } from '@/lib/data/sessions'

export default async function SessionsPage() {
  const context = await requireActiveSpace()
  const result = await listSessions(context.activeSpaceId)
  const sessions = result.ok ? result.data.sessions : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Sessions</h2>
          <p className="text-muted-foreground">Manage the schedule for the active space.</p>
        </div>
        <Button render={<Link href="/sessions/new" />}>Create session</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Starts</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.title}</TableCell>
                  <TableCell>{new Date(session.starts_at).toLocaleString()}</TableCell>
                  <TableCell>{session.capacity}</TableCell>
                  <TableCell>
                    <Badge variant={session.status === 'scheduled' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" render={<Link href={`/sessions/${session.id}`} />}>
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
