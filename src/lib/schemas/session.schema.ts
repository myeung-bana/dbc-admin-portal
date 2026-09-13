import { z } from 'zod'

export const sessionSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  startsAt: z.string().min(1, 'Start time is required'),
  capacity: z.coerce.number().int().min(1).max(100).default(15),
  courtId: z.string().uuid().optional().or(z.literal('')),
  locationId: z.string().uuid().optional().or(z.literal('')),
  status: z.enum(['scheduled', 'cancelled']).default('scheduled'),
})

export type SessionInput = z.infer<typeof sessionSchema>
