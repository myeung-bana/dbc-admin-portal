import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
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
import { listSpaces } from '@/lib/data/spaces'

export default async function SpacesPage() {
  const context = await getAdminContext()
  if (!context.isSuperAdmin) redirect('/dashboard')

  const result = await listSpaces()
  const spaces = result.ok ? result.data.spaces : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Spaces</h2>
          <p className="text-muted-foreground">Manage all platform spaces.</p>
        </div>
        <Button render={<Link href="/master-console/spaces/new" />}>Create space</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All spaces</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spaces.map((space) => (
                <TableRow key={space.id}>
                  <TableCell className="font-medium">{space.name}</TableCell>
                  <TableCell>{space.slug}</TableCell>
                  <TableCell>
                    <Badge variant={space.status === 'active' ? 'default' : 'secondary'}>
                      {space.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" render={<Link href={`/master-console/spaces/${space.id}`} />}>
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
