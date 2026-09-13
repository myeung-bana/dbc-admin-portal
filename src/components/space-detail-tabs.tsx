'use client'

import { useState } from 'react'
import { updateSpaceAction } from '@/app/actions/admin'
import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'
import type { Space, SpaceMembership } from '@/lib/types'

type SpaceDetailTabsProps = {
  space: Space
  memberships: SpaceMembership[]
}

export function SpaceDetailTabs({ space, memberships }: SpaceDetailTabsProps) {
  const updateSpace = updateSpaceAction.bind(null, space.id)
  const [status, setStatus] = useState(space.status)

  return (
    <Tabs defaultValue="general">
      <TabsList variant="line">
        <TabsTrigger value="general">General Details</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>General Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateSpace} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Space name</Label>
                <Input id="name" name="name" defaultValue={space.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" defaultValue={space.slug} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={space.description ?? ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as Space['status'])}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="status" value={status} />
              </div>
              <Button type="submit">Save changes</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="users" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No users in this space yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  memberships.map((membership) => (
                    <TableRow key={membership.id}>
                      <TableCell>{membership.user?.displayName ?? '—'}</TableCell>
                      <TableCell>{membership.user?.email ?? '—'}</TableCell>
                      <TableCell>
                        <Badge>{membership.role}</Badge>
                      </TableCell>
                      <TableCell>{membership.status}</TableCell>
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
