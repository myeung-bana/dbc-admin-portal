import 'server-only'

import { adminGqlRequest, callAdminFunction } from '@/lib/graphql'
import { generateUniqueInviteCode } from '@/lib/invite/code'
import type {
  CreateSpaceInviteInput,
  InviteExistingMemberInput,
} from '@/lib/schemas/membership.schema'
import { createAdminClient } from '@/lib/nhost/admin'
import { getUserRolesFromSession } from '@/lib/nhost/roles'
import { requireServerSession } from '@/lib/nhost/server'
import type { SpaceInvite } from '@/lib/types'

function getActorUserId(session: { user?: { id?: string } | null; decodedToken?: Record<string, unknown> | null }) {
  if (session.user?.id) {
    return session.user.id
  }

  const claims = session.decodedToken?.['https://hasura.io/jwt/claims'] as
    | Record<string, unknown>
    | undefined

  const userId = claims?.['x-hasura-user-id']
  return typeof userId === 'string' ? userId : null
}

function unauthorizedResult(reason: 'missing' | 'expired') {
  return {
    ok: false as const,
    error:
      reason === 'expired'
        ? 'Your session has expired. Please sign in again.'
        : 'Unauthorized',
  }
}

async function assertCanManageSpace(spaceId: string) {
  const auth = await requireServerSession()
  if (!auth.ok) {
    return { ok: false as const, error: unauthorizedResult(auth.reason).error }
  }

  const roles = getUserRolesFromSession(auth.session)
  if (roles.includes('super_admin')) {
    return { ok: true as const, auth }
  }

  if (!roles.includes('organiser')) {
    return { ok: false as const, error: 'Forbidden' }
  }

  const result = await adminGqlRequest<{ space_memberships: Array<{ id: string }> }>(
    `
      query OrganiserSpaceAccess($spaceId: uuid!) {
        space_memberships(
          where: {
            space_id: { _eq: $spaceId }
            role: { _eq: organiser }
            status: { _eq: active }
          }
          limit: 1
        ) {
          id
        }
      }
    `,
    { spaceId },
  )

  if (!result.ok) {
    return { ok: false as const, error: result.error }
  }

  if (!result.data.space_memberships.length) {
    return { ok: false as const, error: 'Forbidden for this space' }
  }

  return { ok: true as const, auth }
}

export async function searchUsers(spaceId: string, query: string) {
  const access = await assertCanManageSpace(spaceId)
  if (!access.ok) {
    return access
  }

  const trimmed = query.trim()
  if (trimmed.length < 2) {
    return { ok: false as const, error: 'Search query must be at least 2 characters' }
  }

  try {
    const admin = createAdminClient()
    const pattern = `%${trimmed.replace(/[%_]/g, '\\$&')}%`

    const { body: membershipResult } = await admin.graphql.request({
      query: `
        query SpaceMemberUserIds($spaceId: uuid!) {
          space_memberships(where: { space_id: { _eq: $spaceId } }) {
            user_id
          }
        }
      `,
      variables: { spaceId },
    })

    if (membershipResult.errors?.length) {
      return {
        ok: false as const,
        error: membershipResult.errors[0]?.message ?? 'Failed to load memberships',
      }
    }

    const excludeIds = (
      (membershipResult.data as { space_memberships?: Array<{ user_id: string }> })
        .space_memberships ?? []
    ).map((row) => row.user_id)

    const { body: usersResult } = await admin.graphql.request({
      query: `
        query SearchUsers($emailPattern: citext!, $namePattern: String!, $excludeIds: [uuid!]!) {
          users(
            where: {
              _and: [
                { id: { _nin: $excludeIds } }
                {
                  _or: [
                    { email: { _ilike: $emailPattern } }
                    { displayName: { _ilike: $namePattern } }
                  ]
                }
              ]
            }
            order_by: { email: asc }
            limit: 20
          ) {
            id
            email
            displayName
            avatarUrl
          }
        }
      `,
      variables: {
        emailPattern: pattern,
        namePattern: pattern,
        excludeIds: excludeIds.length ? excludeIds : ['00000000-0000-0000-0000-000000000000'],
      },
    })

    if (usersResult.errors?.length) {
      return {
        ok: false as const,
        error: usersResult.errors[0]?.message ?? 'Failed to search users',
      }
    }

    const users = (
      usersResult.data as {
        users?: Array<{
          id: string
          email: string
          displayName?: string | null
          avatarUrl?: string | null
        }>
      }
    ).users ?? []

    return { ok: true as const, data: { users } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search users'
    return { ok: false as const, error: message }
  }
}

export async function inviteExistingMember(
  spaceId: string,
  input: InviteExistingMemberInput,
) {
  const access = await assertCanManageSpace(spaceId)
  if (!access.ok) {
    return access
  }

  try {
    const admin = createAdminClient()

    const { body: userResult } = await admin.graphql.request({
      query: `
        query UserById($id: uuid!) {
          user(id: $id) {
            id
            email
            displayName
          }
        }
      `,
      variables: { id: input.userId },
    })

    if (userResult.errors?.length) {
      return {
        ok: false as const,
        error: userResult.errors[0]?.message ?? 'Failed to load user',
      }
    }

    const user = (userResult.data as {
      user?: { id: string; email: string; displayName?: string | null } | null
    }).user

    if (!user) {
      return { ok: false as const, error: 'User not found' }
    }

    const { body: existingResult } = await admin.graphql.request({
      query: `
        query ExistingMembership($spaceId: uuid!, $userId: uuid!) {
          space_memberships(
            where: {
              space_id: { _eq: $spaceId }
              user_id: { _eq: $userId }
            }
            limit: 1
          ) {
            id
            status
          }
        }
      `,
      variables: { spaceId, userId: input.userId },
    })

    if (existingResult.errors?.length) {
      return {
        ok: false as const,
        error: existingResult.errors[0]?.message ?? 'Failed to check membership',
      }
    }

    const existing = (
      existingResult.data as {
        space_memberships?: Array<{ id: string; status: string }>
      }
    ).space_memberships?.[0]

    if (existing?.status === 'active') {
      return { ok: false as const, error: 'User is already an active member of this space' }
    }

    const { body: result } = await admin.graphql.request({
      query: `
        mutation InviteMembership($object: space_memberships_insert_input!) {
          insert_space_memberships_one(
            object: $object
            on_conflict: {
              constraint: space_memberships_space_id_user_id_key
              update_columns: [role, status, invited_by, updated_at]
            }
          ) {
            id
            space_id
            user_id
            role
            status
          }
        }
      `,
      variables: {
        object: {
          space_id: spaceId,
          user_id: input.userId,
          role: input.role,
          status: 'pending',
          invited_by: getActorUserId(access.auth.session),
        },
      },
    })

    if (result.errors?.length) {
      return {
        ok: false as const,
        error: result.errors[0]?.message ?? 'Failed to create invite',
      }
    }

    return {
      ok: true as const,
      data: {
        membership: (result.data as {
          insert_space_memberships_one?: Record<string, unknown>
        })?.insert_space_memberships_one,
        user,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send invite'
    return { ok: false as const, error: message }
  }
}

export async function createSpaceInvite(spaceId: string, input: CreateSpaceInviteInput) {
  const access = await assertCanManageSpace(spaceId)
  if (!access.ok) {
    return access
  }

  try {
    const admin = createAdminClient()
    const code = await generateUniqueInviteCode(async (candidate) => {
      const { body } = await admin.graphql.request({
        query: `
          query InviteCodeExists($code: citext!) {
            space_invites(where: { code: { _eq: $code } }, limit: 1) {
              id
            }
          }
        `,
        variables: { code: candidate },
      })

      if (body.errors?.length) {
        throw new Error(body.errors[0]?.message ?? 'Failed to check invite code')
      }

      return (
        (body.data as { space_invites?: Array<{ id: string }> }).space_invites?.length ?? 0
      ) > 0
    })

    const { body: result } = await admin.graphql.request({
      query: `
        mutation CreateSpaceInvite($object: space_invites_insert_input!) {
          insert_space_invites_one(object: $object) {
            id
            space_id
            code
            role
            label
            email
            expires_at
            status
            created_at
          }
        }
      `,
      variables: {
        object: {
          space_id: spaceId,
          code,
          role: input.role,
          label: input.label?.trim() || null,
          email: input.email?.trim().toLowerCase() || null,
          created_by: getActorUserId(access.auth.session),
          status: 'open',
          max_uses: 1,
        },
      },
    })

    if (result.errors?.length) {
      return {
        ok: false as const,
        error: result.errors[0]?.message ?? 'Failed to create invite',
      }
    }

    const invite = (result.data as {
      insert_space_invites_one?: SpaceInvite
    })?.insert_space_invites_one

    if (!invite) {
      return { ok: false as const, error: 'Failed to create invite' }
    }

    return { ok: true as const, data: { invite } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create invite'
    return { ok: false as const, error: message }
  }
}

export async function revokeSpaceInvite(inviteId: string) {
  const auth = await requireServerSession()
  if (!auth.ok) return unauthorizedResult(auth.reason)

  try {
    const admin = createAdminClient()
    const { body: inviteResult } = await admin.graphql.request({
      query: `
        query InviteForRevoke($id: uuid!) {
          space_invites_by_pk(id: $id) {
            id
            space_id
            status
          }
        }
      `,
      variables: { id: inviteId },
    })

    if (inviteResult.errors?.length) {
      return {
        ok: false as const,
        error: inviteResult.errors[0]?.message ?? 'Failed to load invite',
      }
    }

    const invite = (inviteResult.data as {
      space_invites_by_pk?: { id: string; space_id: string; status: string } | null
    }).space_invites_by_pk

    if (!invite) {
      return { ok: false as const, error: 'Invite not found' }
    }

    const access = await assertCanManageSpace(invite.space_id)
    if (!access.ok) {
      return access
    }

    if (invite.status !== 'open') {
      return { ok: false as const, error: 'Only open invites can be revoked' }
    }

    const { body: updateResult } = await admin.graphql.request({
      query: `
        mutation RevokeInvite($id: uuid!) {
          update_space_invites_by_pk(
            pk_columns: { id: $id }
            _set: { status: revoked }
          ) {
            id
            status
          }
        }
      `,
      variables: { id: invite.id },
    })

    if (updateResult.errors?.length) {
      return {
        ok: false as const,
        error: updateResult.errors[0]?.message ?? 'Failed to revoke invite',
      }
    }

    return {
      ok: true as const,
      data: {
        invite: (updateResult.data as {
          update_space_invites_by_pk?: Record<string, unknown>
        })?.update_space_invites_by_pk,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to revoke invite'
    return { ok: false as const, error: message }
  }
}

export async function listSpaceInvites(spaceId: string) {
  return adminGqlRequest<{ space_invites: SpaceInvite[] }>(
    `
      query SpaceInvites($spaceId: uuid!) {
        space_invites(
          where: { space_id: { _eq: $spaceId } }
          order_by: { created_at: desc }
        ) {
          id
          space_id
          code
          role
          label
          email
          expires_at
          status
          created_at
        }
      }
    `,
    { spaceId },
  )
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
