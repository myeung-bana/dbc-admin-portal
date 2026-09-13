import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { requireActiveSpace } from '@/lib/admin-context'
import { listSessions } from '@/lib/data/sessions'
import { listSpaceMemberships } from '@/lib/data/spaces'

export default async function DashboardPage() {
  const context = await requireActiveSpace()
  const [sessionsResult, membersResult] = await Promise.all([
    listSessions(context.activeSpaceId),
    listSpaceMemberships(context.activeSpaceId),
  ])

  const sessions = sessionsResult.ok ? sessionsResult.data.sessions : []
  const members = membersResult.ok ? membersResult.data.space_memberships : []
  const upcoming = sessions.filter((session) => session.status === 'scheduled').slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Space dashboard</h2>
        <p className="text-muted-foreground">
          Overview for{' '}
          {context.spaces.find((space) => space.id === context.activeSpaceId)?.name ??
            'selected space'}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming sessions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{upcoming.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{members.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button render={<Link href="/sessions/new" />}>Create session</Button>
            <Button variant="outline" render={<Link href="/members/invite" />}>
              Invite member
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scheduled sessions yet.</p>
          ) : (
            upcoming.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{session.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.starts_at).toLocaleString()}
                  </p>
                </div>
                <Button variant="outline" size="sm" render={<Link href={`/sessions/${session.id}`} />}>
                  View
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
