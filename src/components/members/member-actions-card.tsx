'use client'

import { useState, useTransition } from 'react'
import {
  assignPassCreditsAction,
  changeMemberRoleAction,
  promoteMemberAction,
} from '@/app/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionMutation } from '@/hooks/use-action-mutation'
import { handleActionResult } from '@/lib/toast/action-feedback'
import type { SpaceMembership } from '@/lib/types'

type MemberActionsCardProps = {
  membership: SpaceMembership
  spaceId: string
  userId: string
  passBalance?: number
}

export function MemberActionsCard({
  membership,
  spaceId,
  userId,
  passBalance = 0,
}: MemberActionsCardProps) {
  const [amount, setAmount] = useState('5')
  const [note, setNote] = useState('')
  const { run: runPromote, pending: promotePending } = useActionMutation(
    () => promoteMemberAction(spaceId, userId),
    {
      successMessage: 'Promoted to organiser',
      errorMessage: 'Could not promote member',
    },
  )
  const [rolePending, startRoleTransition] = useTransition()
  const [creditsPending, startCreditsTransition] = useTransition()

  function changeRole(role: 'member' | 'casual') {
    const formData = new FormData()
    formData.set('role', role)

    startRoleTransition(async () => {
      const result = await changeMemberRoleAction(spaceId, userId, formData)
      handleActionResult(result, {
        successMessage: role === 'member' ? 'Upgraded to member' : 'Changed to casual',
        errorMessage: 'Could not change role',
      })
    })
  }

  function assignCredits(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startCreditsTransition(async () => {
      const result = await assignPassCreditsAction(spaceId, userId, formData)
      handleActionResult(result, {
        successMessage: 'Credits assigned',
        errorMessage: 'Could not assign credits',
      })
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium">Role</p>
          {membership.role === 'member' ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={promotePending} onClick={runPromote}>
                {promotePending ? 'Promoting…' : 'Promote to organiser'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={rolePending}
                onClick={() => changeRole('casual')}
              >
                {rolePending ? 'Saving…' : 'Downgrade to casual'}
              </Button>
            </div>
          ) : membership.role === 'casual' ? (
            <Button
              type="button"
              disabled={rolePending}
              onClick={() => changeRole('member')}
            >
              {rolePending ? 'Saving…' : 'Upgrade to member'}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Each space must keep at least one organiser. Promotion is only available for members.
            </p>
          )}
        </div>

        {membership.status === 'active' && membership.role !== 'organiser' ? (
          <form onSubmit={assignCredits} className="space-y-3">
            <div>
              <p className="text-sm font-medium">Pass credits</p>
              <p className="text-sm text-muted-foreground">
                Current balance: {passBalance}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit-amount">Credits to add</Label>
              <Input
                id="credit-amount"
                name="amount"
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit-note">Note (optional)</Label>
              <Input
                id="credit-note"
                name="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="e.g. March drop-in pack"
              />
            </div>
            <Button type="submit" variant="outline" disabled={creditsPending}>
              {creditsPending ? 'Assigning…' : 'Assign credits'}
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  )
}
