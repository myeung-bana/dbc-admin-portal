'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FollowersTable,
  MembershipsTable,
  PendingMembershipsTable,
  SpaceInvitesTable,
} from '@/components/members-tabs'
import type { SpaceFollow, SpaceInvite, SpaceMembership } from '@/lib/types'

type MembersTabsProps = {
  memberships: SpaceMembership[]
  followers: SpaceFollow[]
  invites: SpaceInvite[]
}

export function MembersTabs({ memberships, followers, invites }: MembersTabsProps) {
  const activeMembers = memberships.filter(
    (membership) =>
      membership.status === 'active' &&
      (membership.role === 'member' || membership.role === 'organiser'),
  )
  const activeCasuals = memberships.filter(
    (membership) => membership.status === 'active' && membership.role === 'casual',
  )
  const pendingMemberships = memberships.filter((membership) => membership.status === 'pending')
  const oneOffInvites = invites

  return (
    <Tabs defaultValue="members">
      <TabsList variant="line" className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="members">Members ({activeMembers.length})</TabsTrigger>
        <TabsTrigger value="casuals">Casuals ({activeCasuals.length})</TabsTrigger>
        <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
        <TabsTrigger value="pending">Pending ({pendingMemberships.length})</TabsTrigger>
        <TabsTrigger value="invites">One-off codes ({oneOffInvites.length})</TabsTrigger>
      </TabsList>

      <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm">
        <p>
          Use standing join QR codes from{' '}
          <Link href="/dashboard/settings#join-qr" className="font-medium underline underline-offset-4">
            Settings
          </Link>{' '}
          for club-door onboarding. This page is for managing people already connected to your space.
        </p>
      </div>

      <TabsContent value="members" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            <MembershipsTable
              memberships={activeMembers}
              emptyMessage="No active members yet."
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="casuals" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Casuals</CardTitle>
          </CardHeader>
          <CardContent>
            <MembershipsTable
              memberships={activeCasuals}
              emptyMessage="No casual players yet."
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="followers" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Followers</CardTitle>
          </CardHeader>
          <CardContent>
            <FollowersTable followers={followers} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pending" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Pending invites</CardTitle>
          </CardHeader>
          <CardContent>
            <PendingMembershipsTable memberships={pendingMemberships} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="invites" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>One-off invite codes</CardTitle>
          </CardHeader>
          <CardContent>
            <SpaceInvitesTable invites={oneOffInvites} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
