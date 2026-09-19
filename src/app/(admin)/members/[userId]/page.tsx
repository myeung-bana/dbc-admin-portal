import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'
import { MemberActionsCard } from '@/components/members/member-actions-card'
import { MemberActivityCard } from '@/components/members/member-activity-card'
import {
  MemberAccountCard,
  MemberMembershipCard,
} from '@/components/members/member-detail-cards'
import { MemberProfileHeader } from '@/components/members/member-profile-header'
import { Button } from '@/components/ui/button'
import { requireActiveSpace } from '@/lib/admin-context'
import { getPassBalance } from '@/lib/data/memberships'
import { getSpaceMembershipDetail } from '@/lib/data/spaces'
import { redirect } from 'next/navigation'

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const context = await requireActiveSpace()
  const [result, passBalanceResult] = await Promise.all([
    getSpaceMembershipDetail(context.activeSpaceId, userId),
    getPassBalance(context.activeSpaceId, userId),
  ])
  const membership = result.ok ? result.data.space_memberships[0] ?? null : null
  const passBalance = passBalanceResult.ok
    ? passBalanceResult.data.pass_balances[0]?.balance ?? 0
    : 0

  if (!membership) redirect('/members')

  const displayName =
    membership.user?.displayName?.trim() ||
    membership.user?.email ||
    'Unknown member'

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
        <MemberMembershipCard membership={membership} passBalance={passBalance} />
      </div>

      <MemberActionsCard
        membership={membership}
        spaceId={context.activeSpaceId}
        userId={userId}
        passBalance={passBalance}
      />

      <MemberActivityCard />
    </div>
  )
}
