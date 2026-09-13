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
import { listCountries } from '@/lib/data/master-data'

export default async function CountriesPage() {
  const context = await getAdminContext()
  if (!context.isSuperAdmin) redirect('/dashboard')

  const result = await listCountries()
  const countries = result.ok ? result.data.master_countries : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Countries</h2>
          <p className="text-muted-foreground">Manage platform-wide country reference data.</p>
        </div>
        <Button render={<Link href="/master-console/master-data/countries/create" />}>
          Create country
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All countries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Locations</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No countries yet.
                  </TableCell>
                </TableRow>
              ) : (
                countries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className="font-medium">{country.name}</TableCell>
                    <TableCell>{country.code}</TableCell>
                    <TableCell>{country.locations_aggregate.aggregate?.count ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <Link href={`/master-console/master-data/countries/${country.id}`} />
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
