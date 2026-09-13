import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getAdminContext } from '@/lib/admin-context'
import { listLocations } from '@/lib/data/master-data'

export default async function LocationsPage() {
  const context = await getAdminContext()
  if (!context.isSuperAdmin) redirect('/dashboard')

  const result = await listLocations()
  const locations = result.ok ? result.data.master_locations : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Locations</h2>
          <p className="text-muted-foreground">Manage venues and addresses by country.</p>
        </div>
        <Button render={<Link href="/master-console/master-data/locations/create" />}>
          Create location
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All locations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Courts</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No locations yet.
                  </TableCell>
                </TableRow>
              ) : (
                locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{location.country?.name ?? '—'}</TableCell>
                    <TableCell>{location.address ?? '—'}</TableCell>
                    <TableCell>{location.courts_aggregate.aggregate?.count ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <Link href={`/master-console/master-data/locations/${location.id}`} />
                        }
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
