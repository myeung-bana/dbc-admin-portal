import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createCourtAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAdminContext } from '@/lib/admin-context'
import { listLocations } from '@/lib/data/master-data'

export default async function CreateCourtPage({
  searchParams,
}: {
  searchParams: Promise<{ locationId?: string }>
}) {
  const context = await getAdminContext()
  if (!context.isSuperAdmin) redirect('/dashboard')

  const { locationId } = await searchParams
  const locationsResult = await listLocations()
  const locations = locationsResult.ok ? locationsResult.data.master_locations : []

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Create court</h2>
        <p className="text-muted-foreground">Add a new court to the master data taxonomy.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Court details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCourtAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationId">Location</Label>
              <select
                id="locationId"
                name="locationId"
                required
                defaultValue={locationId ?? ''}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                    {location.country?.name ? ` (${location.country.name})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create court</Button>
              <Button variant="outline" render={<Link href="/master-console/master-data/courts" />}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
