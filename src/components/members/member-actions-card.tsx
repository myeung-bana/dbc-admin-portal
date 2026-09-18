import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { SpaceMembership } from '@/lib/types'

type MemberActionsCardProps = {
  membership: SpaceMembership
  promoteAction: () => Promise<void>
}

export function MemberActionsCard({ membership, promoteAction }: MemberActionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {membership.role === 'member' ? (
          <form action={promoteAction}>
            <Button type="submit">Promote to organiser</Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Each space must keep at least one organiser. Promotion is only available for members.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
