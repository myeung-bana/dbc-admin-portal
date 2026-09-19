'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { updateLocationAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useActionForm } from '@/hooks/use-action-form'
import type { MasterCountry, MasterCourt, MasterLocation } from '@/lib/types'

type LocationDetailTabsProps = {
  location: MasterLocation
  countries: MasterCountry[]
  courts: MasterCourt[]
}

export function LocationDetailTabs({
  location,
  countries,
  courts,
}: LocationDetailTabsProps) {
  const [name, setName] = useState(location.name)
  const [address, setAddress] = useState(location.address ?? '')
  const [countryId, setCountryId] = useState(location.country?.id ?? '')
  const { onSubmit, pending } = useActionForm(
    updateLocationAction.bind(null, location.id),
    {
      successMessage: 'Location saved',
      errorMessage: 'Could not save location',
    },
  )

  useEffect(() => {
    setName(location.name)
    setAddress(location.address ?? '')
    setCountryId(location.country?.id ?? '')
  }, [location.id, location.name, location.address, location.country?.id])

  return (
    <Tabs defaultValue="general">
      <TabsList variant="line">
        <TabsTrigger value="general">General Details</TabsTrigger>
        <TabsTrigger value="courts">Courts</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>General Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="countryId">Country</Label>
                <Select
                  value={countryId}
                  onValueChange={(value) => value && setCountryId(value)}
                >
                  <SelectTrigger id="countryId" className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="countryId" value={countryId} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>
              <Button type="submit" disabled={pending}>
                {pending ? 'Saving…' : 'Save changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="courts" className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Courts</CardTitle>
            <Button
              size="sm"
              render={
                <Link
                  href={`/master-console/master-data/courts/create?locationId=${location.id}`}
                />
              }
            >
              Add court
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      No courts at this location yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  courts.map((court) => (
                    <TableRow key={court.id}>
                      <TableCell>{court.name}</TableCell>
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
      </TabsContent>
    </Tabs>
  )
}
