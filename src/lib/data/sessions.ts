import 'server-only'

import { adminGqlRequest } from '@/lib/graphql'
import type { SessionInput } from '@/lib/schemas/session.schema'
import type { Session, SessionBooking } from '@/lib/types'

export async function listSessions(spaceId: string) {
  return adminGqlRequest<{ sessions: Session[] }>(
    `
      query ListSessions($spaceId: uuid!) {
        sessions(
          where: { space_id: { _eq: $spaceId } }
          order_by: { starts_at: asc }
        ) {
          id
          space_id
          title
          starts_at
          capacity
          status
          court { id name }
          location { id name }
        }
      }
    `,
    { spaceId },
  )
}

export async function getSession(sessionId: string) {
  return adminGqlRequest<{ sessions_by_pk: Session | null }>(
    `
      query GetSession($id: uuid!) {
        sessions_by_pk(id: $id) {
          id
          space_id
          title
          starts_at
          capacity
          status
          court { id name }
          location { id name }
        }
      }
    `,
    { id: sessionId },
  )
}

export async function createSession(spaceId: string, input: SessionInput) {
  return adminGqlRequest<{ insert_sessions_one: Session }>(
    `
      mutation CreateSession($object: sessions_insert_input!) {
        insert_sessions_one(object: $object) {
          id
          title
          starts_at
        }
      }
    `,
    {
      object: {
        space_id: spaceId,
        title: input.title,
        starts_at: input.startsAt,
        capacity: input.capacity,
        court_id: input.courtId || null,
        location_id: input.locationId || null,
        status: input.status,
      },
    },
  )
}

export async function updateSession(sessionId: string, input: SessionInput) {
  return adminGqlRequest<{ update_sessions_by_pk: Session }>(
    `
      mutation UpdateSession($id: uuid!, $set: sessions_set_input!) {
        update_sessions_by_pk(pk_columns: { id: $id }, _set: $set) {
          id
          title
          starts_at
          status
        }
      }
    `,
    {
      id: sessionId,
      set: {
        title: input.title,
        starts_at: input.startsAt,
        capacity: input.capacity,
        court_id: input.courtId || null,
        location_id: input.locationId || null,
        status: input.status,
      },
    },
  )
}

export async function listSessionBookings(sessionId: string) {
  return adminGqlRequest<{ session_bookings: SessionBooking[] }>(
    `
      query SessionBookings($sessionId: uuid!) {
        session_bookings(
          where: { session_id: { _eq: $sessionId } }
          order_by: { created_at: asc }
        ) {
          id
          status
          user {
            id
            email
            displayName
          }
        }
      }
    `,
    { sessionId },
  )
}
