'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { AdminViewMode } from '@/lib/admin-view-mode'
import type { Space } from '@/lib/types'

type AdminViewSwitcherProps = {
  viewMode: AdminViewMode
  spaces: Space[]
  activeSpaceId?: string | null
}

export function AdminViewSwitcher({
  viewMode,
  spaces,
  activeSpaceId,
}: AdminViewSwitcherProps) {
  async function switchMode(mode: AdminViewMode) {
    if (mode === viewMode) {
      return
    }

    if (mode === 'space' && spaces.length === 0) {
      return
    }

    const spaceId = activeSpaceId ?? spaces[0]?.id

    await fetch('/api/auth/admin-view-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode,
        ...(mode === 'space' && spaceId ? { spaceId } : {}),
      }),
    })

    window.location.assign(mode === 'super-admin' ? '/master-console/spaces' : '/dashboard')
  }

  return (
    <ToggleGroup
      value={[viewMode]}
      onValueChange={(values) => {
        const mode = values[0]
        if (mode === 'super-admin' || mode === 'space') {
          void switchMode(mode)
        }
      }}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="super-admin" aria-label="Master Console view">
        Master Console
      </ToggleGroupItem>
      <ToggleGroupItem value="space" aria-label="View as space" disabled={spaces.length === 0}>
        View as Space
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
