import { InviteMemberTabs } from '@/components/invite-member-tabs'
import { requireActiveSpace } from '@/lib/admin-context'

export default async function InviteMemberPage() {
  const context = await requireActiveSpace()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Invite member</h2>
        <p className="text-muted-foreground">
          Invite someone who already uses DBC, or generate a shareable invite code and QR for a new
          player.
        </p>
      </div>
      <InviteMemberTabs spaceId={context.activeSpaceId} />
    </div>
  )
}
