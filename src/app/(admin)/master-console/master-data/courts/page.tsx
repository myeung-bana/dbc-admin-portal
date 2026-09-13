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
import { listCourts } from '@/lib/data/master-data'

export default async function CourtsPage() {
  const context = await getAdminContext()
  if (!context.isSuperAdmin) redirect('/dashboard')

  const result = await listCourts()
  const courts = result.ok ? result.data.master_courts : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Courts</h2>
          <p className="text-muted-foreground">Manage courts within each location.</p>
        </div>
        <Button render={<Link href="/master-console/master-data/courts/create" />}>
          Create court
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All courts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No courts yet.
                  </TableCell>
                </TableRow>
              ) : (
                courts.map((court) => (
                  <TableRow key={court.id}>
                    <TableCell className="font-medium">{court.name}</TableCell>
                    <TableCell>{court.location?.name ?? '—'}</TableCell>
                    <TableCell>{court.location?.country?.name ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <Link href={`/master-console/master-data/courts/${court.id}`} />
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
