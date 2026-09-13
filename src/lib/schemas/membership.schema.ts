import { z } from 'zod'

export const inviteMemberSchema = z.object({
  email: z.email('Valid email is required'),
  displayName: z.string().optional(),
  role: z.enum(['member', 'casual', 'organiser']).default('member'),
  password: z.string().min(9, 'Password must be at least 9 characters').optional(),
})

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
