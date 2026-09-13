import { z } from 'zod'

export const countrySchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(3),
})

export const locationSchema = z.object({
  name: z.string().min(2),
  countryId: z.string().uuid(),
  address: z.string().optional(),
})

export const courtSchema = z.object({
  name: z.string().min(2),
  locationId: z.string().uuid(),
})

export const updateCountrySchema = countrySchema
export const updateLocationSchema = locationSchema
export const updateCourtSchema = courtSchema

export type CountryInput = z.infer<typeof countrySchema>
export type LocationInput = z.infer<typeof locationSchema>
export type CourtInput = z.infer<typeof courtSchema>
