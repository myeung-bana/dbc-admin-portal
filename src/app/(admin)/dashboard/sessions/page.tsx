import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SessionsListTabs } from '@/components/sessions-list-tabs'
import { requireActiveSpace } from '@/lib/admin-context'
import { listSessions } from '@/lib/data/sessions'
import type { Session } from '@/lib/types'

function splitSessions(sessions: Session[]) {
  const now = Date.now()
  const upcoming = sessions
    .filter((session) => new Date(session.starts_at).getTime() >= now)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
  const past = sessions
    .filter((session) => new Date(session.starts_at).getTime() < now)
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())

  return { upcoming, past }
}

export default async function SessionsPage() {
  const context = await requireActiveSpace()
  const result = await listSessions(context.activeSpaceId)
  const sessions = result.ok ? result.data.sessions : []
  const { upcoming, past } = splitSessions(sessions)

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Sessions</h2>
          <p className="text-muted-foreground">Manage the schedule for the active space.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" render={<Link href="/dashboard/sessions/import" />}>
            Import season
          </Button>
          <Button render={<Link href="/dashboard/sessions/create" />}>Create session</Button>
        </div>
      </div>
      <SessionsListTabs upcoming={upcoming} past={past} />
    </div>
  )
}
