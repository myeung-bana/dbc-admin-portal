import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createCountryAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAdminContext } from '@/lib/admin-context'

export default async function CreateCountryPage() {
  const context = await getAdminContext()
  if (!context.isSuperAdmin) redirect('/dashboard')

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Create country</h2>
        <p className="text-muted-foreground">Add a new country to the master data taxonomy.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Country details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCountryAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" required maxLength={3} placeholder="SG" />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create country</Button>
              <Button variant="outline" render={<Link href="/master-console/master-data/countries" />}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
