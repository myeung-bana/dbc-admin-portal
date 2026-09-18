import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarDisplaySrc } from '@/lib/profile/avatar-url'
import { cn } from '@/lib/utils'

type UserAvatarProps = {
  displayName?: string | null
  avatarUrl?: string | null
  cacheRevision?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'size-10 text-sm',
  md: 'size-12 text-base',
  lg: 'size-24 text-2xl',
  xl: 'size-28 text-3xl',
} as const

export function UserAvatar({
  displayName,
  avatarUrl,
  cacheRevision = 0,
  size = 'md',
  className,
}: UserAvatarProps) {
  const initials = displayName?.trim().slice(0, 1).toUpperCase() || '?'
  const imageSrc = getAvatarDisplaySrc(avatarUrl, cacheRevision)

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {imageSrc ? <AvatarImage key={imageSrc} src={imageSrc} alt="" /> : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}
