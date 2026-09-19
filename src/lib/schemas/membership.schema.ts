import { z } from 'zod'

export const inviteExistingMemberSchema = z.object({
  userId: z.uuid('Select a user'),
  role: z.enum(['member', 'casual']).default('member'),
})

export const createSpaceInviteSchema = z.object({
  role: z.enum(['member', 'casual']).default('member'),
  label: z.string().trim().optional(),
  email: z.union([z.literal(''), z.email('Valid email is required')]).optional(),
})

export const changeMemberRoleSchema = z.object({
  role: z.enum(['member', 'casual']),
})

export const assignPassCreditsSchema = z.object({
  amount: z.coerce.number().int().positive('Amount must be at least 1'),
  note: z.string().trim().optional(),
})

export type InviteExistingMemberInput = z.infer<typeof inviteExistingMemberSchema>
export type CreateSpaceInviteInput = z.infer<typeof createSpaceInviteSchema>
export type ChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>
export type AssignPassCreditsInput = z.infer<typeof assignPassCreditsSchema>
