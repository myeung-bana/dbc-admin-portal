'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateActiveSpaceSettingsAction } from '@/app/actions/admin'
import { handleActionResult } from '@/lib/toast/action-feedback'
import { SpaceJoinQrCard } from '@/components/space-join-qr-card'
import { SpaceLogoEditor } from '@/components/settings/space-logo-editor'
import { SpaceLogo } from '@/components/space-logo'
import { SpaceStatusBadge, SpaceVisibilityBadge } from '@/components/status-badge'
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
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import type { Space } from '@/lib/types'

function formatDate(value?: string | null) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium sm:text-right">{value}</dd>
    </div>
  )
}

type SpaceSettingsCardProps = {
  space: Space
  spaceId: string
  memberCount: number
  upcomingSessionCount: number
}

export function SpaceSettingsCard({
  space,
  spaceId,
  memberCount,
  upcomingSessionCount,
}: SpaceSettingsCardProps) {
  const router = useRouter()
  const [visibility, setVisibility] = useState(space.visibility)
  const [savePending, startSave] = useTransition()

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    formData.set('visibility', visibility)

    startSave(async () => {
      const result = await updateActiveSpaceSettingsAction(spaceId, formData)
      handleActionResult(result, {
        successMessage: 'Space settings saved',
        errorMessage: 'Could not save settings',
        onRefresh: () => router.refresh(),
      })
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active space</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-4">
          <SpaceLogo name={space.name} logoUrl={space.logo_url} size="lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">{space.name}</h3>
              <p className="text-sm text-muted-foreground">{space.slug}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <SpaceStatusBadge status={space.status} />
              <SpaceVisibilityBadge visibility={space.visibility} />
            </div>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailRow label="Started" value={formatDate(space.created_at)} />
          <DetailRow label="Members" value={memberCount} />
          <DetailRow label="Upcoming sessions" value={upcomingSessionCount} />
        </dl>

        <Separator />

        <form onSubmit={onSubmit} className="space-y-4">
          <SpaceLogoEditor
            spaceId={spaceId}
            name={space.name}
            initialLogoUrl={space.logo_url}
          />

          <div className="space-y-2">
            <Label htmlFor="space-name">Space name</Label>
            <Input id="space-name" name="name" defaultValue={space.name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="space-slug">Slug</Label>
            <Input id="space-slug" name="slug" defaultValue={space.slug} required />
            <p className="text-xs text-muted-foreground">
              Unique handle for this space, like an Instagram username.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="space-description">Description</Label>
            <Textarea
              id="space-description"
              name="description"
              rows={3}
              defaultValue={space.description ?? ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="space-visibility">Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(value) => setVisibility(value as Space['visibility'])}
            >
              <SelectTrigger id="space-visibility" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="invite_only">Invite only</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="visibility" value={visibility} />
            <p className="text-xs text-muted-foreground">
              Public spaces can be discovered by anyone. Invite-only spaces require membership.
            </p>
          </div>

          <Button type="submit" disabled={savePending}>
            {savePending ? 'Saving…' : 'Save space settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function SpaceJoinLinksCard({ slug }: { slug: string }) {
  return <SpaceJoinQrCard slug={slug} />
}
