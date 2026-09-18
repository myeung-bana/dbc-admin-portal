import { Building2Icon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getStorageImageSrc } from '@/lib/profile/avatar-url'
import { cn } from '@/lib/utils'

type SpaceLogoProps = {
  name: string
  logoUrl?: string | null
  cacheRevision?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'size-8 [&_svg]:size-4',
  md: 'size-10 [&_svg]:size-5',
  lg: 'size-14 [&_svg]:size-7',
  xl: 'size-24 [&_svg]:size-10',
} as const

export function SpaceLogo({
  name,
  logoUrl,
  cacheRevision = 0,
  size = 'md',
  className,
}: SpaceLogoProps) {
  const initials = name.trim().slice(0, 1).toUpperCase() || '?'
  const imageSrc = getStorageImageSrc(logoUrl, cacheRevision)

  return (
    <Avatar className={cn('rounded-full', sizeClasses[size], className)}>
      {imageSrc ? <AvatarImage key={imageSrc} src={imageSrc} alt="" /> : null}
      <AvatarFallback className="rounded-full bg-muted text-muted-foreground">
        {imageSrc ? initials : <Building2Icon />}
      </AvatarFallback>
    </Avatar>
  )
}
