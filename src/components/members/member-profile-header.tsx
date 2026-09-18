import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/user-avatar'
import type { SpaceMembership } from '@/lib/types'

type MemberProfileHeaderProps = {
  displayName: string
  email?: string | null
  avatarUrl?: string | null
  role: SpaceMembership['role']
  status: SpaceMembership['status']
}

export function MemberProfileHeader({
  displayName,
  email,
  avatarUrl,
  role,
  status,
}: MemberProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <UserAvatar displayName={displayName} avatarUrl={avatarUrl} size="xl" />
      <div className="min-w-0 flex-1 space-y-2 pt-1">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{displayName}</h2>
          {email ? <p className="text-muted-foreground">{email}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{role}</Badge>
          <Badge variant="secondary">{status}</Badge>
        </div>
      </div>
    </div>
  )
}
