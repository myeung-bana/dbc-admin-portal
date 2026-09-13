import { z } from 'zod'

export const sessionSchema = z
  .object({
    title: z.string().min(2, 'Title is required'),
    startsAt: z.string().min(1, 'Start time is required'),
    endsAt: z.string().min(1, 'End time is required'),
    capacity: z.coerce.number().int().min(1).max(100).default(15),
    courtId: z.string().uuid().optional().or(z.literal('')),
    locationId: z.string().uuid().optional().or(z.literal('')),
    status: z.enum(['scheduled', 'cancelled']).default('scheduled'),
  })
  .refine((value) => new Date(value.endsAt).getTime() > new Date(value.startsAt).getTime(), {
    message: 'End time must be after start time',
    path: ['endsAt'],
  })

export type SessionInput = z.infer<typeof sessionSchema>
