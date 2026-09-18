'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function unwrapActionResult<T>(
  result: { ok: true; data: T } | { ok: false; error: string },
): T {
  if (!result.ok) {
    throw new Error(result.error)
  }

  return result.data
}
import { createSpace, archiveSpace, updateSpace, updateSpaceLogo, updateSpaceSettings } from '@/lib/data/spaces'
import {
  createSpaceInvite,
  inviteExistingMember,
  promoteMember,
  revokeSpaceInvite,
  searchUsers,
} from '@/lib/data/memberships'
import { bulkCreateSessions, createSession, listSessions, updateSession } from '@/lib/data/sessions'
import {
  createCountry,
  createCourt,
  createLocation,
  getCourt,
  listCourts,
  listLocations,
  updateCountry,
  updateCourt,
  updateLocation,
} from '@/lib/data/master-data'
import type { SessionInput } from '@/lib/schemas/session.schema'
import { createSpaceSchema, updateSpaceSchema, updateSpaceSettingsSchema } from '@/lib/schemas/space.schema'
import {
  createSpaceInviteSchema,
  inviteExistingMemberSchema,
} from '@/lib/schemas/membership.schema'
import { sessionSchema } from '@/lib/schemas/session.schema'
import { bulkImportPayloadSchema } from '@/lib/schemas/bulk-session.schema'
import {
  resolveBulkSessionRows,
  toBulkSessionInserts,
  type ResolvedBulkSessionRow,
} from '@/lib/sessions/bulk-import'

import {
  countrySchema,
  courtSchema,
  locationSchema,
  updateCountrySchema,
  updateCourtSchema,
  updateLocationSchema,
} from '@/lib/schemas/master-data.schema'
import { getAdminContext, requireActiveSpace } from '@/lib/admin-context'
import { requireServerSession } from '@/lib/nhost/server'
import { getUserRolesFromSession, isOrganiserRole, isSuperAdmin } from '@/lib/nhost/roles'
import { uploadSpaceLogoFile } from '@/lib/nhost/upload-space-logo'
import {
  SPACE_LOGO_ACCEPT,
  SPACE_LOGO_MAX_BYTES,
} from '@/lib/spaces/logo-constants'

export async function createSpaceAction(formData: FormData) {
  const parsed = createSpaceSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug') || undefined,
    description: formData.get('description') || undefined,
    organiserEmail: formData.get('organiserEmail'),
    organiserDisplayName: formData.get('organiserDisplayName'),
    organiserPassword: formData.get('organiserPassword') || undefined,
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const result = unwrapActionResult(await createSpace(parsed.data))

  revalidatePath('/master-console/spaces')
  redirect(`/master-console/spaces/${result.space.id}`)
}

export async function updateSpaceAction(spaceId: string, formData: FormData) {
  const parsed = updateSpaceSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || undefined,
    status: formData.get('status'),
    visibility: formData.get('visibility') || 'public',
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  unwrapActionResult(await updateSpace(spaceId, parsed.data))

  revalidatePath('/master-console/spaces')
  revalidatePath(`/master-console/spaces/${spaceId}`)
  revalidatePath('/dashboard/settings')
}

function validateLogoFile(file: File | null) {
  if (!file || file.size === 0) {
    return { ok: false as const, error: 'Choose a logo image to upload' }
  }

  if (file.size > SPACE_LOGO_MAX_BYTES) {
    return { ok: false as const, error: 'Logo must be 5 MB or smaller' }
  }

  const allowedTypes = SPACE_LOGO_ACCEPT.split(',')
  if (!allowedTypes.includes(file.type)) {
    return { ok: false as const, error: 'Logo must be JPG, PNG, or WebP' }
  }

  return { ok: true as const, file }
}

export async function updateActiveSpaceSettingsAction(spaceId: string, formData: FormData) {
  const context = await requireActiveSpace()
  if (context.activeSpaceId !== spaceId) {
    throw new Error('You can only edit the active space')
  }

  const parsed = updateSpaceSettingsSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || undefined,
    visibility: formData.get('visibility') || 'public',
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const result = await updateSpaceSettings(spaceId, parsed.data)
  if (!result.ok) {
    throw new Error(result.error)
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  revalidatePath('/members')
}

async function assertCanManageSpace(spaceId: string) {
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

  const roles = getUserRolesFromSession(auth.session)
  if (isSuperAdmin(roles)) {
    return { ok: true as const, auth }
  }

  if (isOrganiserRole(roles)) {
    const context = await getAdminContext()
    if (context.activeSpaceId === spaceId) {
      return { ok: true as const, auth }
    }
  }

  return { ok: false as const, error: 'You can only edit spaces you manage' }
}

export async function uploadSpaceLogoAction(spaceId: string, formData: FormData) {
  const access = await assertCanManageSpace(spaceId)
  if (!access.ok) {
    return access
  }

  const fileInput = formData.get('logo')
  const validated = validateLogoFile(fileInput instanceof File ? fileInput : null)
  if (!validated.ok) {
    return validated
  }

  const uploadResult = await uploadSpaceLogoFile(validated.file, access.auth.nhost)
  if (!uploadResult.ok) {
    return uploadResult
  }

  const updateResult = await updateSpaceLogo(spaceId, uploadResult.logoUrl)
  if (!updateResult.ok) {
    return { ok: false as const, error: updateResult.error }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  revalidatePath('/master-console/spaces')
  revalidatePath(`/master-console/spaces/${spaceId}`)

  return {
    ok: true as const,
    data: {
      logoUrl: uploadResult.logoUrl,
      space: updateResult.data.update_spaces_by_pk,
    },
  }
}

export async function removeSpaceLogoAction(spaceId: string) {
  const access = await assertCanManageSpace(spaceId)
  if (!access.ok) {
    return access
  }

  const result = await updateSpaceLogo(spaceId, null)
  if (!result.ok) {
    return { ok: false as const, error: result.error }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  revalidatePath('/master-console/spaces')
  revalidatePath(`/master-console/spaces/${spaceId}`)

  return { ok: true as const, data: { space: result.data.update_spaces_by_pk } }
}

export async function archiveSpaceAction(spaceId: string) {
  const result = await archiveSpace(spaceId)
  if (!result.ok) return result
  revalidatePath('/master-console/spaces')
  return result
}

export async function searchUsersAction(spaceId: string, query: string) {
  return searchUsers(spaceId, query)
}

export async function inviteExistingMemberAction(spaceId: string, formData: FormData) {
  const parsed = inviteExistingMemberSchema.safeParse({
    userId: formData.get('userId'),
    role: formData.get('role') || 'member',
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const result = await inviteExistingMember(spaceId, parsed.data)
  if (!result.ok) {
    throw new Error(result.error)
  }

  revalidatePath('/members')
  redirect('/members')
}

export async function createSpaceInviteAction(spaceId: string, formData: FormData) {
  const parsed = createSpaceInviteSchema.safeParse({
    role: formData.get('role') || 'member',
    label: formData.get('label') || undefined,
    email: formData.get('email') || undefined,
  })

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const result = await createSpaceInvite(spaceId, parsed.data)
  if (!result.ok) {
    return { ok: false as const, error: result.error }
  }

  revalidatePath('/members')
  return { ok: true as const, data: result.data.invite }
}

export async function revokeSpaceInviteAction(inviteId: string) {
  const result = await revokeSpaceInvite(inviteId)
  if (!result.ok) {
    throw new Error(result.error)
  }

  revalidatePath('/members')
  return result
}

export async function promoteMemberAction(spaceId: string, userId: string) {
  unwrapActionResult(await promoteMember(spaceId, userId))
  revalidatePath('/members')
  revalidatePath(`/members/${userId}`)
}

async function resolveSessionInput(input: SessionInput): Promise<SessionInput> {
  if (!input.courtId) {
    return input
  }

  const courtResult = await getCourt(input.courtId)
  if (!courtResult.ok || !courtResult.data.master_courts_by_pk) {
    throw new Error('Selected court was not found')
  }

  const courtLocationId = courtResult.data.master_courts_by_pk.location?.id
  if (input.locationId && courtLocationId && input.locationId !== courtLocationId) {
    throw new Error('Court does not belong to the selected location')
  }

  return {
    ...input,
    locationId: input.locationId || courtLocationId || '',
  }
}

export async function createSessionAction(spaceId: string, formData: FormData) {
  const parsed = sessionSchema.safeParse({
    title: formData.get('title'),
    startsAt: formData.get('startsAt'),
    endsAt: formData.get('endsAt'),
    capacity: formData.get('capacity') || 15,
    courtId: formData.get('courtId') || '',
    locationId: formData.get('locationId') || '',
    status: formData.get('status') || 'scheduled',
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const input = await resolveSessionInput(parsed.data)
  const result = unwrapActionResult(await createSession(spaceId, input))

  revalidatePath('/dashboard/sessions')
  redirect(`/dashboard/sessions/${result.insert_sessions_one.id}`)
}

export async function updateSessionAction(sessionId: string, formData: FormData) {
  const parsed = sessionSchema.safeParse({
    title: formData.get('title'),
    startsAt: formData.get('startsAt'),
    endsAt: formData.get('endsAt'),
    capacity: formData.get('capacity') || 15,
    courtId: formData.get('courtId') || '',
    locationId: formData.get('locationId') || '',
    status: formData.get('status') || 'scheduled',
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const input = await resolveSessionInput(parsed.data)
  unwrapActionResult(await updateSession(sessionId, input))

  revalidatePath('/dashboard/sessions')
  revalidatePath(`/dashboard/sessions/${sessionId}`)
  redirect(`/dashboard/sessions/${sessionId}`)
}

export async function createCountryAction(formData: FormData) {
  const parsed = countrySchema.safeParse({
    name: formData.get('name'),
    code: formData.get('code'),
  })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const result = unwrapActionResult(await createCountry(parsed.data))
  revalidatePath('/master-console/master-data/countries')
  redirect(`/master-console/master-data/countries/${result.insert_master_countries_one.id}`)
}

export async function updateCountryAction(countryId: string, formData: FormData) {
  const parsed = updateCountrySchema.safeParse({
    name: formData.get('name'),
    code: formData.get('code'),
  })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  unwrapActionResult(await updateCountry(countryId, parsed.data))
  revalidatePath('/master-console/master-data/countries')
  revalidatePath(`/master-console/master-data/countries/${countryId}`)
}

export async function createLocationAction(formData: FormData) {
  const parsed = locationSchema.safeParse({
    name: formData.get('name'),
    countryId: formData.get('countryId'),
    address: formData.get('address') || undefined,
  })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const result = unwrapActionResult(await createLocation(parsed.data))
  const countryId = parsed.data.countryId
  revalidatePath('/master-console/master-data/locations')
  revalidatePath(`/master-console/master-data/countries/${countryId}`)
  redirect(`/master-console/master-data/locations/${result.insert_master_locations_one.id}`)
}

export async function updateLocationAction(locationId: string, formData: FormData) {
  const parsed = updateLocationSchema.safeParse({
    name: formData.get('name'),
    countryId: formData.get('countryId'),
    address: formData.get('address') || undefined,
  })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  unwrapActionResult(await updateLocation(locationId, parsed.data))
  revalidatePath('/master-console/master-data/locations')
  revalidatePath(`/master-console/master-data/locations/${locationId}`)
  revalidatePath(`/master-console/master-data/countries/${parsed.data.countryId}`)
}

export async function createCourtAction(formData: FormData) {
  const parsed = courtSchema.safeParse({
    name: formData.get('name'),
    locationId: formData.get('locationId'),
  })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const result = unwrapActionResult(await createCourt(parsed.data))
  revalidatePath('/master-console/master-data/courts')
  revalidatePath(`/master-console/master-data/locations/${parsed.data.locationId}`)
  redirect(`/master-console/master-data/courts/${result.insert_master_courts_one.id}`)
}

export async function updateCourtAction(courtId: string, formData: FormData) {
  const parsed = updateCourtSchema.safeParse({
    name: formData.get('name'),
    locationId: formData.get('locationId'),
  })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  unwrapActionResult(await updateCourt(courtId, parsed.data))
  revalidatePath('/master-console/master-data/courts')
  revalidatePath(`/master-console/master-data/courts/${courtId}`)
  revalidatePath(`/master-console/master-data/locations/${parsed.data.locationId}`)
}

export type BulkImportPreviewResult =
  | { ok: true; rows: ResolvedBulkSessionRow[]; preview: true }
  | { ok: true; count: number; preview: false }
  | { ok: false; error: string }

export async function bulkImportSessionsAction(
  spaceId: string,
  payloadJson: string,
  preview: boolean,
): Promise<BulkImportPreviewResult> {
  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(payloadJson)
  } catch {
    return { ok: false, error: 'Invalid import payload' }
  }

  const parsed = bulkImportPayloadSchema.safeParse(parsedJson)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid import data' }
  }

  const [locationsResult, courtsResult, sessionsResult] = await Promise.all([
    listLocations(),
    listCourts(),
    listSessions(spaceId),
  ])

  if (!locationsResult.ok) return { ok: false, error: locationsResult.error }
  if (!courtsResult.ok) return { ok: false, error: courtsResult.error }
  if (!sessionsResult.ok) return { ok: false, error: sessionsResult.error }

  const resolved = resolveBulkSessionRows(
    parsed.data,
    locationsResult.data.master_locations,
    courtsResult.data.master_courts,
    sessionsResult.data.sessions,
  )

  if (preview) {
    return { ok: true, rows: resolved, preview: true }
  }

  const validRows = resolved.filter((row) => row.rowErrors.length === 0)
  if (validRows.length === 0) {
    return { ok: false, error: 'No valid sessions to import' }
  }

  const objects = toBulkSessionInserts(spaceId, validRows)
  const result = await bulkCreateSessions(objects)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }

  revalidatePath('/dashboard/sessions')
  return {
    ok: true,
    count: result.data.insert_sessions.affected_rows,
    preview: false,
  }
}

