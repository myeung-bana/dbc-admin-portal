import 'server-only'

import { redirect } from 'next/navigation'
import { resolveAdminViewMode, type AdminViewMode } from '@/lib/admin-view-mode'
import { listOrganiserSpaces, listSpaces } from '@/lib/data/spaces'
import {
  getActiveSpaceId,
  getAdminViewModeCookie,
  getUserRoles,
  isOrganiser,
  isSuperAdmin,
  requireServerSession,
} from '@/lib/nhost/server'
import type { Space } from '@/lib/types'

export async function getAdminContext() {
  const auth = await requireServerSession()
  if (!auth.ok) {
    redirect(auth.reason === 'expired' ? '/login?error=session-expired' : '/login')
  }

  const roles = await getUserRoles(auth.session)
  const superAdmin = isSuperAdmin(roles)
  const organiser = isOrganiser(roles)

  if (!superAdmin && !organiser) {
    redirect('/login?error=unauthorized')
  }

  let spaces: Space[] = []

  if (superAdmin) {
    const result = await listSpaces()
    if (!result.ok && result.error.includes('session has expired')) {
      redirect('/login?error=session-expired')
    }
    if (result.ok) {
      spaces = result.data.spaces.filter((space) => space.status === 'active')
    }
  } else {
    const result = await listOrganiserSpaces()
    if (!result.ok && result.error.includes('session has expired')) {
      redirect('/login?error=session-expired')
    }
    if (result.ok) {
      spaces = result.data.space_memberships
        .map((membership) => membership.space)
        .filter((space) => space.status === 'active')
    }
  }

  const viewMode = resolveAdminViewMode(superAdmin, await getAdminViewModeCookie())
  const activeSpaceId = (await getActiveSpaceId()) ?? spaces[0]?.id ?? null

  return {
    session: auth.session,
    roles,
    isSuperAdmin: superAdmin,
    isOrganiser: organiser,
    viewMode,
    spaces,
    activeSpaceId,
    user: {
      name:
        auth.session.user?.displayName ??
        auth.session.user?.email ??
        'Admin User',
      email: auth.session.user?.email ?? '',
    },
  }
}

export async function requireSuperAdminView() {
  const context = await getAdminContext()

  if (!context.isSuperAdmin) {
    redirect('/dashboard')
  }

  if (context.viewMode === 'space') {
    redirect('/dashboard')
  }

  return context
}

export async function requireActiveSpace() {
  const context = await getAdminContext()

  if (context.isSuperAdmin && context.viewMode === 'super-admin') {
    redirect('/master-console/spaces')
  }

  if (!context.activeSpaceId) {
    if (context.isSuperAdmin) {
      redirect('/master-console/spaces')
    }

    redirect('/login?error=no-space')
  }

  return { ...context, activeSpaceId: context.activeSpaceId }
}

export type AdminContext = Awaited<ReturnType<typeof getAdminContext>>

export type { AdminViewMode }
