'use client'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatSessionTimeRange, formatSessionVenue } from '@/lib/sessions/format'
import type { Session } from '@/lib/types'

type SessionsListTabsProps = {
  upcoming: Session[]
  past: Session[]
}

function SessionsTable({
  sessions,
  emptyMessage,
}: {
  sessions: Session[]
  emptyMessage: string
}) {
  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>When</TableHead>
          <TableHead>Venue</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell className="font-medium">{session.title}</TableCell>
            <TableCell>{formatSessionTimeRange(session)}</TableCell>
            <TableCell>{formatSessionVenue(session)}</TableCell>
            <TableCell>{session.capacity}</TableCell>
            <TableCell>
              <Badge variant={session.status === 'scheduled' ? 'default' : 'secondary'}>
                {session.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="outline"
                size="sm"
                render={<Link href={`/dashboard/sessions/${session.id}`} />}
              >
                Open
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function SessionsListTabs({ upcoming, past }: SessionsListTabsProps) {
  return (
    <Tabs defaultValue="upcoming">
      <TabsList variant="line">
        <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
        <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <SessionsTable
              sessions={upcoming}
              emptyMessage="No upcoming sessions scheduled."
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="past">
        <Card>
          <CardHeader>
            <CardTitle>Past sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <SessionsTable sessions={past} emptyMessage="No past sessions yet." />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
