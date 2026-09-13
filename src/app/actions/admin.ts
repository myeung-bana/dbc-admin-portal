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
import { createSpace, archiveSpace, updateSpace } from '@/lib/data/spaces'
import { inviteMember, promoteMember } from '@/lib/data/memberships'
import { createSession, updateSession } from '@/lib/data/sessions'
import {
  createCountry,
  createCourt,
  createLocation,
  updateCountry,
  updateCourt,
  updateLocation,
} from '@/lib/data/master-data'
import { createSpaceSchema, updateSpaceSchema } from '@/lib/schemas/space.schema'
import { inviteMemberSchema } from '@/lib/schemas/membership.schema'
import { sessionSchema } from '@/lib/schemas/session.schema'
import {
  countrySchema,
  courtSchema,
  locationSchema,
  updateCountrySchema,
  updateCourtSchema,
  updateLocationSchema,
} from '@/lib/schemas/master-data.schema'

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
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  unwrapActionResult(await updateSpace(spaceId, parsed.data))

  revalidatePath('/master-console/spaces')
  revalidatePath(`/master-console/spaces/${spaceId}`)
}

export async function archiveSpaceAction(spaceId: string) {
  const result = await archiveSpace(spaceId)
  if (!result.ok) return result
  revalidatePath('/master-console/spaces')
  return result
}

export async function inviteMemberAction(spaceId: string, formData: FormData) {
  const parsed = inviteMemberSchema.safeParse({
    email: formData.get('email'),
    displayName: formData.get('displayName') || undefined,
    role: formData.get('role') || 'member',
    password: formData.get('password') || undefined,
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  unwrapActionResult(await inviteMember(spaceId, parsed.data))

  revalidatePath('/members')
  redirect('/members')
}

export async function promoteMemberAction(spaceId: string, userId: string) {
  unwrapActionResult(await promoteMember(spaceId, userId))
  revalidatePath('/members')
  revalidatePath(`/members/${userId}`)
}

export async function createSessionAction(spaceId: string, formData: FormData) {
  const parsed = sessionSchema.safeParse({
    title: formData.get('title'),
    startsAt: formData.get('startsAt'),
    capacity: formData.get('capacity') || 15,
    courtId: formData.get('courtId') || '',
    locationId: formData.get('locationId') || '',
    status: formData.get('status') || 'scheduled',
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const result = unwrapActionResult(await createSession(spaceId, parsed.data))

  revalidatePath('/sessions')
  redirect(`/sessions/${result.insert_sessions_one.id}`)
}

export async function updateSessionAction(sessionId: string, formData: FormData) {
  const parsed = sessionSchema.safeParse({
    title: formData.get('title'),
    startsAt: formData.get('startsAt'),
    capacity: formData.get('capacity') || 15,
    courtId: formData.get('courtId') || '',
    locationId: formData.get('locationId') || '',
    status: formData.get('status') || 'scheduled',
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  unwrapActionResult(await updateSession(sessionId, parsed.data))

  revalidatePath('/sessions')
  revalidatePath(`/sessions/${sessionId}`)
  redirect(`/sessions/${sessionId}`)
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
