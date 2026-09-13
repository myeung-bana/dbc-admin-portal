import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createLocationAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAdminContext } from '@/lib/admin-context'
import { listCountries } from '@/lib/data/master-data'

export default async function CreateLocationPage({
  searchParams,
}: {
  searchParams: Promise<{ countryId?: string }>
}) {
  const context = await getAdminContext()
  if (!context.isSuperAdmin) redirect('/dashboard')

  const { countryId } = await searchParams
  const countriesResult = await listCountries()
  const countries = countriesResult.ok ? countriesResult.data.master_countries : []

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Create location</h2>
        <p className="text-muted-foreground">Add a new location to the master data taxonomy.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Location details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createLocationAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="countryId">Country</Label>
              <select
                id="countryId"
                name="countryId"
                required
                defaultValue={countryId ?? ''}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create location</Button>
              <Button variant="outline" render={<Link href="/master-console/master-data/locations" />}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
