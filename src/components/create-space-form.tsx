'use client'

import { createSpaceAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useActionForm } from '@/hooks/use-action-form'

export function CreateSpaceForm() {
  const { onSubmit, pending } = useActionForm(createSpaceAction, {
    successMessage: 'Space created',
    errorMessage: 'Could not create space',
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Space name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" placeholder="discovery-badminton-club" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="organiserDisplayName">Organiser name</Label>
        <Input id="organiserDisplayName" name="organiserDisplayName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="organiserEmail">Organiser email</Label>
        <Input id="organiserEmail" name="organiserEmail" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="organiserPassword">Organiser password (new users)</Label>
        <Input id="organiserPassword" name="organiserPassword" type="password" minLength={9} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Creating…' : 'Create space'}
      </Button>
    </form>
  )
}
