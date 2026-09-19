import { redirect } from 'next/navigation'
import { CreateLocationForm } from '@/components/master-data/create-forms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
          <CreateLocationForm countries={countries} defaultCountryId={countryId} />
        </CardContent>
      </Card>
    </div>
  )
}
