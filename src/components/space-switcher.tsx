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

  const items = spaces.map((space) => ({
    value: space.id,
    label: space.name,
  }))
  const value =
    spaces.find((space) => space.id === activeSpaceId)?.id ?? spaces[0]?.id

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Space:</span>
      <Select
        items={items}
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
              {space.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
