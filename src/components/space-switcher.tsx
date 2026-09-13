'use client'

import { useRouter } from 'next/navigation'
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

  const value = activeSpaceId ?? spaces[0]?.id

  return (
    <Select
      value={value}
      onValueChange={async (spaceId) => {
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
            {space.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
