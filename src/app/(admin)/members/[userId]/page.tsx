import { promoteMemberAction } from '@/app/actions/admin'
import { requireActiveSpace } from '@/lib/admin-context'
import { listSpaceMemberships } from '@/lib/data/spaces'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const context = await requireActiveSpace()
  const result = await listSpaceMemberships(context.activeSpaceId)
  const membership = result.ok
    ? result.data.space_memberships.find((item) => item.user_id === userId)
    : null

  if (!membership) redirect('/members')

  const promoteMember = promoteMemberAction.bind(null, context.activeSpaceId, userId)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {membership.user?.displayName ?? membership.user?.email}
        </h2>
        <p className="text-muted-foreground">{membership.user?.email}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Membership</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Badge>{membership.role}</Badge>
            <Badge variant="secondary">{membership.status}</Badge>
          </div>
          {membership.role === 'member' ? (
            <form action={promoteMember}>
              <Button type="submit">Promote to organiser</Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              Each space must keep at least one organiser. Promotion is only available for members.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
