import Link from 'next/link'
import { SessionsImportForm } from '@/components/sessions-import-form'
import { Button } from '@/components/ui/button'
import { requireActiveSpace } from '@/lib/admin-context'
import { listCourts, listLocations } from '@/lib/data/master-data'

export default async function SessionsImportPage() {
  const context = await requireActiveSpace()
  const [locationsResult, courtsResult] = await Promise.all([
    listLocations(),
    listCourts(),
  ])

  const locations = locationsResult.ok ? locationsResult.data.master_locations : []
  const courts = courtsResult.ok ? courtsResult.data.master_courts : []

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Import sessions</h2>
          <p className="text-muted-foreground">
            Upload a season CSV or generate a recurring schedule for the active space.
          </p>
        </div>
        <Button variant="outline" render={<Link href="/dashboard/sessions" />}>
          Back to sessions
        </Button>
      </div>
      <SessionsImportForm
        spaceId={context.activeSpaceId}
        locations={locations}
        courts={courts}
      />
    </div>
  )
}
