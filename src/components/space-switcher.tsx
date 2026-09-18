'use client'

import { useRouter } from 'next/navigation'
import { SpaceLogo } from '@/components/space-logo'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Space } from '@/lib/types'

type SpaceSwitcherProps = {
  spaces: Space[]
  activeSpaceId?: string | null
}

export function SpaceSwitcher({ spaces, activeSpaceId }: SpaceSwitcherProps) {
  const router = useRouter()

  if (spaces.length === 0) {
    return null
  }

  const activeSpace =
    spaces.find((space) => space.id === activeSpaceId) ?? spaces[0] ?? null
  const value = activeSpace?.id

  return (
    <div className="flex items-center gap-2">
      {activeSpace ? (
        <SpaceLogo name={activeSpace.name} logoUrl={activeSpace.logo_url} size="sm" />
      ) : null}
      <span className="text-sm text-muted-foreground">Space:</span>
      <Select
        items={spaces.map((space) => ({ value: space.id, label: space.name }))}
        value={value}
        onValueChange={async (spaceId) => {
          if (!spaceId) return
          await fetch('/api/auth/active-space', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spaceId }),
          })
          router.refresh()
        }}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select space" />
        </SelectTrigger>
        <SelectContent>
          {spaces.map((space) => (
            <SelectItem key={space.id} value={space.id}>
              <span className="flex items-center gap-2">
                <SpaceLogo name={space.name} logoUrl={space.logo_url} size="sm" />
                <span>{space.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
