import 'server-only'

import { adminGqlRequest, callAdminFunction } from '@/lib/graphql'
import type { CreateSpaceInput, UpdateSpaceInput, UpdateSpaceSettingsInput } from '@/lib/schemas/space.schema'
import type { Space, SpaceMembership } from '@/lib/types'
import { requireServerSession } from '@/lib/nhost/server'

const spaceFields = `
  id
  name
  slug
  description
  status
  visibility
  logo_url
  created_at
`

export async function listSpaces() {
  return adminGqlRequest<{ spaces: Space[] }>(
    `
      query ListSpaces {
        spaces(order_by: { created_at: desc }) {
          ${spaceFields}
        }
      }
    `,
  )
}

export async function getSpace(spaceId: string) {
  return adminGqlRequest<{ spaces_by_pk: Space | null }>(
    `
      query GetSpace($id: uuid!) {
        spaces_by_pk(id: $id) {
          ${spaceFields}
        }
      }
    `,
    { id: spaceId },
  )
}

export async function createSpace(input: CreateSpaceInput) {
  const auth = await requireServerSession()
  if (!auth.ok) {
    return {
      ok: false as const,
      error:
        auth.reason === 'expired'
          ? 'Your session has expired. Please sign in again.'
          : 'Unauthorized',
    }
  }

  return callAdminFunction<{
    space: Space
    organiser: { id: string; email: string }
  }>(auth.nhost, '/admin/spaces/create', input)
}

export async function updateSpace(spaceId: string, input: UpdateSpaceInput) {
  const slugCheck = await isSlugAvailable(input.slug, spaceId)
  if (!slugCheck.ok) {
    return slugCheck
  }

  if (!slugCheck.data.available) {
    return {
      ok: false as const,
      error: 'That slug is already taken. Choose a unique handle.',
    }
  }

  return adminGqlRequest<{ update_spaces_by_pk: Space }>(
    `
      mutation UpdateSpace($id: uuid!, $set: spaces_set_input!) {
        update_spaces_by_pk(pk_columns: { id: $id }, _set: $set) {
          ${spaceFields}
        }
      }
    `,
    {
      id: spaceId,
      set: {
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        status: input.status,
        visibility: input.visibility,
      },
    },
  )
}

export async function isSlugAvailable(slug: string, excludeSpaceId?: string) {
  const result = await adminGqlRequest<{
    spaces: Array<{ id: string }>
  }>(
    `
      query SlugAvailability($slug: String!, $excludeId: uuid) {
        spaces(
          where: {
            slug: { _eq: $slug }
            id: { _neq: $excludeId }
          }
          limit: 1
        ) {
          id
        }
      }
    `,
    {
      slug,
      excludeId: excludeSpaceId ?? '00000000-0000-0000-0000-000000000000',
    },
  )

  if (!result.ok) {
    return result
  }

  return {
    ok: true as const,
    data: { available: result.data.spaces.length === 0 },
  }
}

export async function updateSpaceSettings(spaceId: string, input: UpdateSpaceSettingsInput) {
  const slugCheck = await isSlugAvailable(input.slug, spaceId)
  if (!slugCheck.ok) {
    return slugCheck
  }

  if (!slugCheck.data.available) {
    return {
      ok: false as const,
      error: 'That slug is already taken. Choose a unique handle.',
    }
  }

  return adminGqlRequest<{ update_spaces_by_pk: Space }>(
    `
      mutation UpdateSpaceSettings($id: uuid!, $set: spaces_set_input!) {
        update_spaces_by_pk(pk_columns: { id: $id }, _set: $set) {
          ${spaceFields}
        }
      }
    `,
    {
      id: spaceId,
      set: {
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        visibility: input.visibility,
      },
    },
  )
}

export async function updateSpaceLogo(spaceId: string, logoUrl: string | null) {
  return adminGqlRequest<{ update_spaces_by_pk: Space }>(
    `
      mutation UpdateSpaceLogo($id: uuid!, $logoUrl: String) {
        update_spaces_by_pk(pk_columns: { id: $id }, _set: { logo_url: $logoUrl }) {
          ${spaceFields}
        }
      }
    `,
    { id: spaceId, logoUrl },
  )
}

export async function archiveSpace(spaceId: string) {
  return adminGqlRequest<{ update_spaces_by_pk: Space }>(
    `
      mutation ArchiveSpace($id: uuid!) {
        update_spaces_by_pk(pk_columns: { id: $id }, _set: { status: archived }) {
          id
          status
        }
      }
    `,
    { id: spaceId },
  )
}

const spaceMembershipFields = `
  id
  space_id
  user_id
  role
  status
  created_at
  user {
    id
    email
    displayName
    avatarUrl
    createdAt
  }
  invited_by_user {
    id
    email
    displayName
  }
`

export async function listSpaceMemberships(spaceId: string) {
  return adminGqlRequest<{ space_memberships: SpaceMembership[] }>(
    `
      query SpaceMemberships($spaceId: uuid!) {
        space_memberships(
          where: { space_id: { _eq: $spaceId } }
          order_by: { created_at: desc }
        ) {
          ${spaceMembershipFields}
        }
      }
    `,
    { spaceId },
  )
}

export async function getSpaceMembershipDetail(spaceId: string, userId: string) {
  return adminGqlRequest<{ space_memberships: SpaceMembership[] }>(
    `
      query SpaceMembershipDetail($spaceId: uuid!, $userId: uuid!) {
        space_memberships(
          where: {
            space_id: { _eq: $spaceId }
            user_id: { _eq: $userId }
          }
          limit: 1
        ) {
          ${spaceMembershipFields}
        }
      }
    `,
    { spaceId, userId },
  )
}

export async function listOrganiserSpaces() {
  return adminGqlRequest<{ space_memberships: Array<{ space: Space }> }>(
    `
      query OrganiserSpaces {
        space_memberships(
          where: {
            role: { _eq: organiser }
            status: { _eq: active }
          }
          order_by: { created_at: asc }
        ) {
          space {
            id
            name
            slug
            status
            visibility
            logo_url
          }
        }
      }
    `,
  )
}
