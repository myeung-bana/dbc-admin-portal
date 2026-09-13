import { requireActiveSpace } from '@/lib/admin-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function SettingsPage() {
  const context = await requireActiveSpace()
  const activeSpace = context.spaces.find((space) => space.id === context.activeSpaceId)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Profile and active space context.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Signed in as</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium">{context.user.name}</p>
          <p className="text-sm text-muted-foreground">{context.user.email}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {context.roles.map((role) => (
              <Badge key={role}>{role}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active space</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium">{activeSpace?.name ?? 'No space selected'}</p>
          <p className="text-sm text-muted-foreground">{activeSpace?.slug}</p>
        </CardContent>
      </Card>
    </div>
  )
}
