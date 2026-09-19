'use client'

import { useEffect, useState } from 'react'
import { updateSpaceAction } from '@/app/actions/admin'
import { SpaceLogoEditor } from '@/components/settings/space-logo-editor'
import { MembershipStatusBadge } from '@/components/status-badge'
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
import { useActionForm } from '@/hooks/use-action-form'
import type { Space, SpaceMembership } from '@/lib/types'

type SpaceDetailTabsProps = {
  space: Space
  memberships: SpaceMembership[]
}

export function SpaceDetailTabs({ space, memberships }: SpaceDetailTabsProps) {
  const [name, setName] = useState(space.name)
  const [slug, setSlug] = useState(space.slug)
  const [description, setDescription] = useState(space.description ?? '')
  const [status, setStatus] = useState(space.status)
  const [visibility, setVisibility] = useState(space.visibility)
  const { onSubmit, pending } = useActionForm(
    updateSpaceAction.bind(null, space.id),
    {
      successMessage: 'Space saved',
      errorMessage: 'Could not save space',
    },
  )

  useEffect(() => {
    setName(space.name)
    setSlug(space.slug)
    setDescription(space.description ?? '')
    setStatus(space.status)
    setVisibility(space.visibility)
  }, [space.id, space.name, space.slug, space.description, space.status, space.visibility])

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
            <form onSubmit={onSubmit} className="space-y-4">
              <SpaceLogoEditor
                spaceId={space.id}
                name={space.name}
                initialLogoUrl={space.logo_url}
              />

              <div className="space-y-2">
                <Label htmlFor="name">Space name</Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Unique handle for this space, like an Instagram username.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={visibility}
                  onValueChange={(value) => setVisibility(value as Space['visibility'])}
                >
                  <SelectTrigger id="visibility" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="invite_only">Invite only</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="visibility" value={visibility} />
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
              <Button type="submit" disabled={pending}>
                {pending ? 'Saving…' : 'Save changes'}
              </Button>
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
                      <TableCell>
                        <MembershipStatusBadge status={membership.status} />
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
