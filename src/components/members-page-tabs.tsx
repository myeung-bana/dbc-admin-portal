'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MembershipsTable, SpaceInvitesTable } from '@/components/members-tabs'
import type { SpaceInvite, SpaceMembership } from '@/lib/types'

type MembersTabsProps = {
  memberships: SpaceMembership[]
  invites: SpaceInvite[]
}

export function MembersTabs({ memberships, invites }: MembersTabsProps) {
  return (
    <Tabs defaultValue="memberships">
      <TabsList variant="line" className="w-full justify-start">
        <TabsTrigger value="memberships">Memberships</TabsTrigger>
        <TabsTrigger value="invites">Invite codes</TabsTrigger>
      </TabsList>
      <TabsContent value="memberships" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            <MembershipsTable memberships={memberships} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="invites" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Invite codes</CardTitle>
          </CardHeader>
          <CardContent>
            <SpaceInvitesTable invites={invites} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
