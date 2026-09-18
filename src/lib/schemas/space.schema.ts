import { z } from 'zod'

export const createSpaceSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  organiserEmail: z.email('Valid organiser email is required'),
  organiserDisplayName: z.string().min(2, 'Organiser name is required'),
  organiserPassword: z.string().min(9, 'Password must be at least 9 characters').optional(),
})

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>

export const updateSpaceSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'archived']),
  visibility: z.enum(['public', 'invite_only']),
})

export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>

const spaceSlugSchema = z
  .string()
  .min(2, 'Slug is required')
  .max(48, 'Slug must be 48 characters or fewer')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use lowercase letters, numbers, and hyphens only',
  )

export const updateSpaceSettingsSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: spaceSlugSchema,
  description: z.string().optional(),
  visibility: z.enum(['public', 'invite_only']),
})

export type UpdateSpaceSettingsInput = z.infer<typeof updateSpaceSettingsSchema>
