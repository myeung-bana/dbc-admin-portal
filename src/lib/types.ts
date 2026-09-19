export type Space = {
  id: string
  name: string
  slug: string
  description?: string | null
  status: 'active' | 'archived'
  visibility: 'public' | 'invite_only'
  logo_url?: string | null
  created_at: string
}

export type SpaceMembershipUser = {
  id: string
  email?: string | null
  displayName?: string | null
  avatarUrl?: string | null
  createdAt?: string | null
}

export type SpaceMembership = {
  id: string
  space_id: string
  user_id: string
  role: 'organiser' | 'member' | 'casual'
  status: 'pending' | 'active'
  created_at?: string
  user?: SpaceMembershipUser | null
  invited_by_user?: SpaceMembershipUser | null
}

export type SpaceInvite = {
  id: string
  space_id: string
  code: string
  role: 'member' | 'casual'
  label?: string | null
  email?: string | null
  expires_at: string
  status: 'open' | 'redeemed' | 'revoked' | 'expired' | 'exhausted'
  invite_kind?: 'one_off' | 'standing'
  created_at: string
}

export type SpaceFollow = {
  id: string
  space_id: string
  user_id: string
  created_at: string
  user?: SpaceMembershipUser | null
}

export type PassBalance = {
  id: string
  space_id: string
  user_id: string
  balance: number
  updated_at: string
}

export type Session = {
  id: string
  space_id: string
  title: string
  starts_at: string
  ends_at: string
  capacity: number
  status: 'scheduled' | 'cancelled'
  court?: { id: string; name: string; location?: { id: string; name: string } | null } | null
  location?: { id: string; name: string } | null
}

export type SessionBooking = {
  id: string
  status: 'confirmed' | 'waitlisted' | 'cancelled'
  user?: {
    id: string
    email?: string | null
    displayName?: string | null
  } | null
}

export type MasterCountry = {
  id: string
  name: string
  code: string
}

export type MasterLocation = {
  id: string
  name: string
  address?: string | null
  country?: MasterCountry | null
  country_id?: string
}

export type MasterCourt = {
  id: string
  name: string
  location?: (MasterLocation & { country?: MasterCountry | null }) | null
  location_id?: string
}
