'use client'

import { useEffect, useState, useTransition } from 'react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import {
  createSpaceInviteAction,
  inviteExistingMemberAction,
  searchUsersAction,
} from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { buildJoinInviteUrl } from '@/lib/client-app-url'
import type { SpaceInvite } from '@/lib/types'

type SearchUser = {
  id: string
  email: string
  displayName?: string | null
  avatarUrl?: string | null
}

type InviteMemberTabsProps = {
  spaceId: string
}

function RoleSelect({ id, name }: { id: string; name: string }) {
  return (
    <select
      id={id}
      name={name}
      defaultValue="member"
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
    >
      <option value="member">member</option>
      <option value="casual">casual</option>
    </select>
  )
}

function ExistingUserInviteTab({ spaceId }: { spaceId: string }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchUser[]>([])
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null)
  const [searchPending, startSearch] = useTransition()
  const [submitPending, startSubmit] = useTransition()

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  function selectUser(user: SearchUser) {
    setSelectedUser(user)
    setOpen(false)
  }

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    const handle = window.setTimeout(() => {
      startSearch(async () => {
        const result = await searchUsersAction(spaceId, query.trim())
        if (!result.ok) {
          toast.error(result.error)
          setResults([])
          return
        }
        setResults(result.data.users)
      })
    }, 300)

    return () => window.clearTimeout(handle)
  }, [query, spaceId])

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedUser) {
      toast.error('Select a user first')
      return
    }

    const formData = new FormData(event.currentTarget)
    formData.set('userId', selectedUser.id)

    startSubmit(async () => {
      try {
        await inviteExistingMemberAction(spaceId, formData)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to send invite')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite existing user</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Choose someone who already has a DBC account. They will see a pending invite in the
          player app and can accept from Profile.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="outline" />}>Choose user</DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Search users</DialogTitle>
              <DialogDescription>
                Search by email or display name. People already in this space are excluded.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type at least 2 characters…"
                autoFocus
              />
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {query.trim().length < 2 ? (
                  <p className="text-sm text-muted-foreground">Start typing to search.</p>
                ) : searchPending ? (
                  <p className="text-sm text-muted-foreground">Searching…</p>
                ) : results.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No matching users found.</p>
                ) : (
                  results.map((user) => {
                    const selected = selectedUser?.id === user.id
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => selectUser(user)}
                        className={`flex w-full flex-col rounded-lg border px-3 py-2 text-left transition-colors ${
                          selected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                      >
                        <span className="font-medium">
                          {user.displayName?.trim() || user.email}
                        </span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {selectedUser ? (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="font-medium">{selectedUser.displayName?.trim() || selectedUser.email}</p>
            <p className="text-muted-foreground">{selectedUser.email}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No user selected yet.</p>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="existing-role">Role</Label>
            <RoleSelect id="existing-role" name="role" />
          </div>
          <Button type="submit" disabled={!selectedUser || submitPending}>
            {submitPending ? 'Sending invite…' : 'Send invite'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function NewInvitationTab({ spaceId }: { spaceId: string }) {
  const [invite, setInvite] = useState<SpaceInvite | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await createSpaceInviteAction(spaceId, formData)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setInvite(result.data)
      toast.success('Invite code created')
      event.currentTarget.reset()
    })
  }

  const joinUrl = invite ? buildJoinInviteUrl(invite.code) : null

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied`)
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label (optional)</Label>
              <Input id="label" name="label" placeholder="e.g. New player — Alex" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email hint (optional)</Label>
              <Input id="email" name="email" type="email" placeholder="For your reference only" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role">Role</Label>
              <RoleSelect id="new-role" name="role" />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? 'Generating…' : 'Generate invite'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {invite && joinUrl ? (
        <Card>
          <CardHeader>
            <CardTitle>Share this invite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="rounded-xl border bg-white p-4">
                <QRCode value={joinUrl} size={160} />
              </div>
              <div className="w-full space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Invite code</p>
                  <p className="font-mono text-2xl font-semibold tracking-wide">{invite.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Join link</p>
                  <p className="break-all text-sm">{joinUrl}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Expires {new Date(invite.expires_at).toLocaleString()}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyValue(invite.code, 'Code')}
                  >
                    Copy code
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyValue(joinUrl, 'Link')}
                  >
                    Copy link
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setInvite(null)}>
                    Create another
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

export function InviteMemberTabs({ spaceId }: InviteMemberTabsProps) {
  return (
    <Tabs defaultValue="existing">
      <TabsList variant="line" className="w-full justify-start">
        <TabsTrigger value="existing">Existing user</TabsTrigger>
        <TabsTrigger value="new">New invitation</TabsTrigger>
      </TabsList>
      <TabsContent value="existing" className="mt-4">
        <ExistingUserInviteTab spaceId={spaceId} />
      </TabsContent>
      <TabsContent value="new" className="mt-4">
        <NewInvitationTab spaceId={spaceId} />
      </TabsContent>
    </Tabs>
  )
}
