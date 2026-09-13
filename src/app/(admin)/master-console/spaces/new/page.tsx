import { redirect } from 'next/navigation'
import { createSpaceAction } from '@/app/actions/admin'
import { getAdminContext } from '@/lib/admin-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default async function NewSpacePage() {
  const context = await getAdminContext()
  if (!context.isSuperAdmin) redirect('/dashboard')

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Create space</h2>
        <p className="text-muted-foreground">
          Provision a new space and assign its first organiser.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Space details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSpaceAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Space name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" placeholder="discovery-badminton-club" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organiserDisplayName">Organiser name</Label>
              <Input id="organiserDisplayName" name="organiserDisplayName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organiserEmail">Organiser email</Label>
              <Input id="organiserEmail" name="organiserEmail" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organiserPassword">Organiser password (new users)</Label>
              <Input id="organiserPassword" name="organiserPassword" type="password" minLength={9} />
            </div>
            <Button type="submit">Create space</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
