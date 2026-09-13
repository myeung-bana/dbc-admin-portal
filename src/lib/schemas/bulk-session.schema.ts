import { z } from 'zod'

export const BULK_SESSION_MAX_ROWS = 200

export const bulkSessionRowSchema = z
  .object({
    title: z.string().min(2, 'Title is required'),
    startsAt: z.string().min(1, 'Start time is required'),
    endsAt: z.string().min(1, 'End time is required'),
    capacity: z.coerce.number().int().min(1).max(100).default(15),
    locationName: z.string().optional(),
    courtName: z.string().optional(),
    locationId: z.string().uuid().optional(),
    courtId: z.string().uuid().optional(),
    status: z.enum(['scheduled', 'cancelled']).default('scheduled'),
  })
  .refine((value) => new Date(value.endsAt).getTime() > new Date(value.startsAt).getTime(), {
    message: 'End time must be after start time',
    path: ['endsAt'],
  })

export type BulkSessionRow = z.infer<typeof bulkSessionRowSchema>

export const bulkImportPayloadSchema = z
  .array(bulkSessionRowSchema)
  .min(1, 'At least one session is required')
  .max(BULK_SESSION_MAX_ROWS, `Maximum ${BULK_SESSION_MAX_ROWS} sessions per import`)

export const recurringSessionSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  capacity: z.coerce.number().int().min(1).max(100).default(15),
  locationId: z.string().uuid().optional().or(z.literal('')),
  courtId: z.string().uuid().optional().or(z.literal('')),
  status: z.enum(['scheduled', 'cancelled']).default('scheduled'),
})

export type RecurringSessionInput = z.infer<typeof recurringSessionSchema>

export const CSV_TEMPLATE = `title,starts_at,ends_at,capacity,location_name,court_name,status
Tuesday Social,2026-10-07T19:00:00+08:00,2026-10-07T21:00:00+08:00,15,Tung Chung Sports Centre,Court 1,scheduled
Thursday League,2026-10-09T20:00:00+08:00,2026-10-09T22:00:00+08:00,15,Tung Chung Sports Centre,Court 2,scheduled`
