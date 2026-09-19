import { createSessionAction } from '@/app/actions/admin'
import { SessionForm } from '@/components/session-form'
import { requireActiveSpace } from '@/lib/admin-context'
import { listCourts, listLocations } from '@/lib/data/master-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function NewSessionPage() {
  const context = await requireActiveSpace()
  const [locationsResult, courtsResult] = await Promise.all([
    listLocations(),
    listCourts(),
  ])

  const locations = locationsResult.ok ? locationsResult.data.master_locations : []
  const courts = courtsResult.ok ? courtsResult.data.master_courts : []
  const createSession = createSessionAction.bind(null, context.activeSpaceId)

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Create session</h2>
        <p className="text-muted-foreground">Schedule a new session for the active space.</p>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Session details</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionForm
            action={createSession}
            locations={locations}
            courts={courts}
            submitLabel="Create session"
            successMessage="Session created"
            errorMessage="Could not create session"
          />
        </CardContent>
      </Card>
    </div>
  )
}
