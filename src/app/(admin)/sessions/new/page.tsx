import { createSessionAction } from '@/app/actions/admin'
import { requireActiveSpace } from '@/lib/admin-context'
import { listCourts, listLocations } from '@/lib/data/master-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Create session</h2>
        <p className="text-muted-foreground">Schedule a new session for the active space.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Session details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSession} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startsAt">Start time</Label>
              <Input id="startsAt" name="startsAt" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" name="capacity" type="number" defaultValue={15} min={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationId">Location</Label>
              <select
                id="locationId"
                name="locationId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="courtId">Court</Label>
              <select
                id="courtId"
                name="courtId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Create session</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
