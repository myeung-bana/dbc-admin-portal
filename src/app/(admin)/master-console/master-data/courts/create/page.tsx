import { redirect } from 'next/navigation'
import { CreateCourtForm } from '@/components/master-data/create-forms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
          <CreateCourtForm locations={locations} defaultLocationId={locationId} />
        </CardContent>
      </Card>
    </div>
  )
}
