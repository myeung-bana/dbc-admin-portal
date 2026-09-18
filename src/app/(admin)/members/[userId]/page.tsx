import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'
import { promoteMemberAction } from '@/app/actions/admin'
import { MemberAccountCard, MemberMembershipCard } from '@/components/members/member-detail-cards'
import { MemberActionsCard } from '@/components/members/member-actions-card'
import { MemberActivityCard } from '@/components/members/member-activity-card'
import { MemberProfileHeader } from '@/components/members/member-profile-header'
import { Button } from '@/components/ui/button'
import { requireActiveSpace } from '@/lib/admin-context'
import { getSpaceMembershipDetail } from '@/lib/data/spaces'
import { redirect } from 'next/navigation'

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const context = await requireActiveSpace()
  const result = await getSpaceMembershipDetail(context.activeSpaceId, userId)
  const membership = result.ok ? result.data.space_memberships[0] ?? null : null

  if (!membership) redirect('/members')

  const displayName =
    membership.user?.displayName?.trim() ||
    membership.user?.email ||
    'Unknown member'
  const promoteMember = promoteMemberAction.bind(null, context.activeSpaceId, userId)

  return (
    <div className="w-full space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2.5"
        render={<Link href="/members" />}
      >
        <ChevronLeftIcon />
        Back to members
      </Button>

      <MemberProfileHeader
        displayName={displayName}
        email={membership.user?.email}
        avatarUrl={membership.user?.avatarUrl}
        role={membership.role}
        status={membership.status}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <MemberAccountCard user={membership.user} />
        <MemberMembershipCard membership={membership} />
      </div>

      <MemberActionsCard membership={membership} promoteAction={promoteMember} />

      <MemberActivityCard />
    </div>
  )
}
