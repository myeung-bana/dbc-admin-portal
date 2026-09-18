import {
  AccountSettingsCard,
} from '@/components/settings/settings-cards'
import { SpaceSettingsCard } from '@/components/settings/space-settings-form'
import { requireActiveSpace } from '@/lib/admin-context'
import { listSessions } from '@/lib/data/sessions'
import { getSpace, listSpaceMemberships } from '@/lib/data/spaces'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const context = await requireActiveSpace()

  const [spaceResult, membersResult, sessionsResult] = await Promise.all([
    getSpace(context.activeSpaceId),
    listSpaceMemberships(context.activeSpaceId),
    listSessions(context.activeSpaceId),
  ])

  const space = spaceResult.ok ? spaceResult.data.spaces_by_pk : null
  if (!space) redirect('/dashboard')

  const memberCount = membersResult.ok ? membersResult.data.space_memberships.length : 0
  const upcomingSessionCount = sessionsResult.ok
    ? sessionsResult.data.sessions.filter((session) => session.status === 'scheduled').length
    : 0

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your active space and account.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SpaceSettingsCard
          space={space}
          spaceId={context.activeSpaceId}
          memberCount={memberCount}
          upcomingSessionCount={upcomingSessionCount}
        />

        <AccountSettingsCard
          name={context.user.name}
          email={context.user.email}
          roles={context.roles}
        />
      </div>
    </div>
  )
}
