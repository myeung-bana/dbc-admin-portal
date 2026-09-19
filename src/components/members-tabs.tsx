'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { revokeSpaceInviteAction } from '@/app/actions/admin'
import {
  handleActionResult,
  toastActionSuccess,
} from '@/lib/toast/action-feedback'
import { MembershipStatusBadge, SpaceInviteStatusBadge } from '@/components/status-badge'
import { TablePagination } from '@/components/table-pagination'
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
import { usePagination } from '@/hooks/use-pagination'
import { buildJoinInviteUrl } from '@/lib/client-app-url'
import type { SpaceFollow, SpaceInvite, SpaceMembership } from '@/lib/types'

export function SpaceInvitesTable({ invites }: { invites: SpaceInvite[] }) {
  const [pending, startTransition] = useTransition()
  const { page, pageSize, totalItems, totalPages, pageItems, goToPage } =
    usePagination(invites)

  function onRevoke(inviteId: string) {
    startTransition(async () => {
      const result = await revokeSpaceInviteAction(inviteId)
      handleActionResult(result, {
        successMessage: 'Invite revoked',
        errorMessage: 'Failed to revoke invite',
      })
    })
  }

  return (
    <div className="space-y-4">
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
          {pageItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                No invite codes yet.{' '}
                <Link href="/members/invite" className="underline underline-offset-4">
                  Generate one
                </Link>
                .
              </TableCell>
            </TableRow>
          ) : (
            pageItems.map((invite) => (
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
                        toastActionSuccess('Link copied')
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
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={goToPage}
      />
    </div>
  )
}

export function MembershipsTable({
  memberships,
  emptyMessage = 'No memberships yet.',
}: {
  memberships: SpaceMembership[]
  emptyMessage?: string
}) {
  const { page, pageSize, totalItems, totalPages, pageItems, goToPage } =
    usePagination(memberships)

  return (
    <div className="space-y-4">
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
          {pageItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            pageItems.map((membership) => {
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
      <TablePagination
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={goToPage}
      />
    </div>
  )
}

export function PendingMembershipsTable({ memberships }: { memberships: SpaceMembership[] }) {
  return (
    <MembershipsTable memberships={memberships} emptyMessage="No pending invites." />
  )
}

export function FollowersTable({ followers }: { followers: SpaceFollow[] }) {
  const { page, pageSize, totalItems, totalPages, pageItems, goToPage } =
    usePagination(followers)

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Follower</TableHead>
            <TableHead>Following since</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-muted-foreground">
                No followers yet.
              </TableCell>
            </TableRow>
          ) : (
            pageItems.map((follow) => {
              const displayName =
                follow.user?.displayName?.trim() || follow.user?.email || '—'

              return (
                <TableRow key={follow.id} className="h-20">
                  <TableCell className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        displayName={displayName}
                        avatarUrl={follow.user?.avatarUrl}
                        size="sm"
                      />
                      <div className="min-w-0 whitespace-normal">
                        <p className="truncate font-medium">{displayName}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {follow.user?.email ?? '—'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground">
                    {new Date(follow.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
      <TablePagination
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={goToPage}
      />
    </div>
  )
}
