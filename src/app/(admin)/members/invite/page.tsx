import { inviteMemberAction } from '@/app/actions/admin'
import { requireActiveSpace } from '@/lib/admin-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function InviteMemberPage() {
  const context = await requireActiveSpace()
  const inviteMember = inviteMemberAction.bind(null, context.activeSpaceId)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Invite member</h2>
        <p className="text-muted-foreground">
          Send an invite into the active space. New users need a temporary password.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Invite details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={inviteMember} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" name="displayName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                defaultValue="member"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="member">member</option>
                <option value="casual">casual</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (new users only)</Label>
              <Input id="password" name="password" type="password" minLength={9} />
            </div>
            <Button type="submit">Send invite</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
