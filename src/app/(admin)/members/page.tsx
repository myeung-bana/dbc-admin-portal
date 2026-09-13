import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { requireActiveSpace } from '@/lib/admin-context'
import { listSpaceMemberships } from '@/lib/data/spaces'

export default async function MembersPage() {
  const context = await requireActiveSpace()
  const result = await listSpaceMemberships(context.activeSpaceId)
  const memberships = result.ok ? result.data.space_memberships : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Members</h2>
          <p className="text-muted-foreground">People signed up to this space.</p>
        </div>
        <Button render={<Link href="/members/invite" />}>Invite member</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Memberships</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships.map((membership) => (
                <TableRow key={membership.id}>
                  <TableCell>{membership.user?.displayName ?? '—'}</TableCell>
                  <TableCell>{membership.user?.email ?? '—'}</TableCell>
                  <TableCell>
                    <Badge>{membership.role}</Badge>
                  </TableCell>
                  <TableCell>{membership.status}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={`/members/${membership.user_id}`} />}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
