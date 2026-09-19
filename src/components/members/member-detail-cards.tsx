import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MembershipStatusBadge } from '@/components/status-badge'
import type { SpaceMembership, SpaceMembershipUser } from '@/lib/types'

function formatDate(value?: string | null) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatUserLabel(user?: SpaceMembershipUser | null) {
  if (!user) return '—'

  return user.displayName?.trim() || user.email || '—'
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium sm:text-right">{value}</dd>
    </div>
  )
}

type MemberAccountCardProps = {
  user?: SpaceMembershipUser | null
}

export function MemberAccountCard({ user }: MemberAccountCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <DetailRow label="Display name" value={user?.displayName?.trim() || '—'} />
          <DetailRow label="Email" value={user?.email ?? '—'} />
          <DetailRow label="Member since" value={formatDate(user?.createdAt)} />
        </dl>
      </CardContent>
    </Card>
  )
}

type MemberMembershipCardProps = {
  membership: SpaceMembership
  passBalance?: number
}

export function MemberMembershipCard({
  membership,
  passBalance,
}: MemberMembershipCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <DetailRow label="Role" value={membership.role} />
          <DetailRow label="Status" value={<MembershipStatusBadge status={membership.status} />} />
          {membership.role === 'casual' ? (
            <DetailRow label="Pass credits" value={passBalance ?? 0} />
          ) : null}
          <DetailRow label="Joined space" value={formatDate(membership.created_at)} />
          <DetailRow label="Invited by" value={formatUserLabel(membership.invited_by_user)} />
        </dl>
      </CardContent>
    </Card>
  )
}
