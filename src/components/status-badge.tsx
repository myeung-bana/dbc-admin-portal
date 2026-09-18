import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Space, SpaceInvite, SpaceMembership } from '@/lib/types'

type StatusTone = 'success' | 'warning' | 'neutral' | 'danger'

const toneClassNames: Record<StatusTone, string> = {
  success:
    'border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-200',
  warning:
    'border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/60 dark:text-amber-200',
  neutral:
    'border-border bg-muted text-muted-foreground dark:bg-muted/50 dark:text-muted-foreground',
  danger:
    'border-red-200 bg-red-100 text-red-900 dark:border-red-900/50 dark:bg-red-950/60 dark:text-red-200',
}

type StatusBadgeProps = {
  tone: StatusTone
  label: string
  className?: string
}

export function StatusBadge({ tone, label, className }: StatusBadgeProps) {
  return <Badge className={cn(toneClassNames[tone], className)}>{label}</Badge>
}

export function SpaceStatusBadge({
  status,
  className,
}: {
  status: Space['status']
  className?: string
}) {
  const tone = status === 'active' ? 'success' : 'neutral'

  return <StatusBadge tone={tone} label={status} className={className} />
}

export function SpaceVisibilityBadge({
  visibility,
  className,
}: {
  visibility: Space['visibility']
  className?: string
}) {
  const tone = visibility === 'public' ? 'success' : 'warning'
  const label = visibility === 'public' ? 'public' : 'invite only'

  return <StatusBadge tone={tone} label={label} className={className} />
}

export function MembershipStatusBadge({
  status,
  className,
}: {
  status: SpaceMembership['status']
  className?: string
}) {
  const tone = status === 'pending' ? 'warning' : 'success'

  return <StatusBadge tone={tone} label={status} className={className} />
}

export function SpaceInviteStatusBadge({
  status,
  className,
}: {
  status: SpaceInvite['status']
  className?: string
}) {
  const tone =
    status === 'open'
      ? 'warning'
      : status === 'redeemed'
        ? 'success'
        : 'neutral'

  return <StatusBadge tone={tone} label={status} className={className} />
}
