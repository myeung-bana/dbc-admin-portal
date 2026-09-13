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
})

export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>
