'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { revokeSpaceInviteAction } from '@/app/actions/admin'
import { MembershipStatusBadge, SpaceInviteStatusBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserAvatar } from '@/components/user-avatar'
import { buildJoinInviteUrl } from '@/lib/client-app-url'
import type { SpaceInvite, SpaceMembership } from '@/lib/types'

export function SpaceInvitesTable({ invites }: { invites: SpaceInvite[] }) {
  const [pending, startTransition] = useTransition()

  function onRevoke(inviteId: string) {
    startTransition(async () => {
      try {
        await revokeSpaceInviteAction(inviteId)
        toast.success('Invite revoked')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to revoke invite')
      }
    })
  }

  if (invites.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No invite codes yet.{' '}
        <Link href="/members/invite" className="underline underline-offset-4">
          Generate one
        </Link>
        .
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Label / email</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invites.map((invite) => (
          <TableRow key={invite.id}>
            <TableCell>
              <div className="space-y-1">
                <p>{invite.label?.trim() || '—'}</p>
                {invite.email ? (
                  <p className="text-xs text-muted-foreground">{invite.email}</p>
                ) : null}
              </div>
            </TableCell>
            <TableCell className="font-mono text-sm">{invite.code}</TableCell>
            <TableCell>
              <Badge>{invite.role}</Badge>
            </TableCell>
            <TableCell>
              <SpaceInviteStatusBadge status={invite.status} />
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(invite.expires_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(buildJoinInviteUrl(invite.code))
                    toast.success('Link copied')
                  }}
                >
                  Copy link
                </Button>
                {invite.status === 'open' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => onRevoke(invite.id)}
                  >
                    Revoke
                  </Button>
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function MembershipsTable({ memberships }: { memberships: SpaceMembership[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {memberships.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-muted-foreground">
              No memberships yet.
            </TableCell>
          </TableRow>
        ) : (
          memberships.map((membership) => {
            const displayName =
              membership.user?.displayName?.trim() ||
              membership.user?.email ||
              '—'

            return (
              <TableRow key={membership.id} className="h-20">
                <TableCell className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      displayName={displayName}
                      avatarUrl={membership.user?.avatarUrl}
                      size="sm"
                    />
                    <div className="min-w-0 whitespace-normal">
                      <p className="truncate font-medium">{displayName}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {membership.user?.email ?? '—'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge>{membership.role}</Badge>
                </TableCell>
                <TableCell className="py-4">
                  <MembershipStatusBadge status={membership.status} />
                </TableCell>
                <TableCell className="py-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/members/${membership.user_id}`} />}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
