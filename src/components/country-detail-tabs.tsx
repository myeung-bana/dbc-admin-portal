'use client'

import Link from 'next/link'
import { updateCountryAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { MasterCountry, MasterLocation } from '@/lib/types'

type CountryDetailTabsProps = {
  country: MasterCountry
  locations: MasterLocation[]
}

export function CountryDetailTabs({ country, locations }: CountryDetailTabsProps) {
  const updateCountry = updateCountryAction.bind(null, country.id)

  return (
    <Tabs defaultValue="general">
      <TabsList variant="line">
        <TabsTrigger value="general">General Details</TabsTrigger>
        <TabsTrigger value="locations">Locations</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>General Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateCountry} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={country.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" name="code" defaultValue={country.code} required maxLength={3} />
              </div>
              <Button type="submit">Save changes</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="locations" className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Locations</CardTitle>
            <Button
              size="sm"
              render={
                <Link
                  href={`/master-console/master-data/locations/create?countryId=${country.id}`}
                />
              }
            >
              Add location
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      No locations in this country yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>{location.name}</TableCell>
                      <TableCell>{location.address ?? '—'}</TableCell>
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
      </TabsContent>
    </Tabs>
  )
}
