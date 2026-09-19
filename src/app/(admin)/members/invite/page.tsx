import Link from 'next/link'
import { InviteMemberTabs } from '@/components/invite-member-tabs'
import { requireActiveSpace } from '@/lib/admin-context'

export default async function InviteMemberPage() {
  const context = await requireActiveSpace()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Invite member</h2>
        <p className="text-muted-foreground">
          Send targeted invites to specific people. For club-door QR codes, use{' '}
          <Link href="/dashboard/settings#join-qr" className="underline underline-offset-4">
            Settings → Space join links
          </Link>
          .
        </p>
      </div>
      <InviteMemberTabs spaceId={context.activeSpaceId} />
    </div>
  )
}
