import 'server-only'

import { callAdminFunction } from '@/lib/graphql'
import type { InviteMemberInput } from '@/lib/schemas/membership.schema'
import { requireServerSession } from '@/lib/nhost/server'

function unauthorizedResult(reason: 'missing' | 'expired') {
  return {
    ok: false as const,
    error:
      reason === 'expired'
        ? 'Your session has expired. Please sign in again.'
        : 'Unauthorized',
  }
}

export async function inviteMember(spaceId: string, input: InviteMemberInput) {
  const auth = await requireServerSession()
  if (!auth.ok) return unauthorizedResult(auth.reason)

  return callAdminFunction(auth.nhost, '/admin/memberships/invite', {
    spaceId,
    ...input,
  })
}

export async function promoteMember(spaceId: string, userId: string) {
  const auth = await requireServerSession()
  if (!auth.ok) return unauthorizedResult(auth.reason)

  return callAdminFunction(auth.nhost, '/admin/memberships/promote', {
    spaceId,
    userId,
  })
}

export async function demoteOrganiser(spaceId: string, userId: string) {
  const auth = await requireServerSession()
  if (!auth.ok) return unauthorizedResult(auth.reason)

  return callAdminFunction(auth.nhost, '/admin/memberships/demote', {
    spaceId,
    userId,
  })
}
