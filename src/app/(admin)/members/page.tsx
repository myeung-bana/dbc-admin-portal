import Link from 'next/link'
import { MembersTabs } from '@/components/members-page-tabs'
import { Button } from '@/components/ui/button'
import { requireActiveSpace } from '@/lib/admin-context'
import { listSpaceFollowers, listSpaceInvites } from '@/lib/data/memberships'
import { listSpaceMemberships } from '@/lib/data/spaces'

export default async function MembersPage() {
  const context = await requireActiveSpace()
  const [membershipsResult, invitesResult, followersResult] = await Promise.all([
    listSpaceMemberships(context.activeSpaceId),
    listSpaceInvites(context.activeSpaceId),
    listSpaceFollowers(context.activeSpaceId),
  ])

  const memberships = membershipsResult.ok ? membershipsResult.data.space_memberships : []
  const invites = invitesResult.ok ? invitesResult.data.space_invites : []
  const followers = followersResult.ok ? followersResult.data.space_follows : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Members</h2>
          <p className="text-muted-foreground">
            Memberships and shareable invite codes for this space.
          </p>
        </div>
        <Button render={<Link href="/members/invite" />}>Invite member</Button>
      </div>
      <MembersTabs memberships={memberships} followers={followers} invites={invites} />
    </div>
  )
}
