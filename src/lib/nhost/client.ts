'use client'

import {
  createClient,
  withClientSideSessionMiddleware,
  type StoredSession,
} from '@nhost/nhost-js'
import { getPublicNhostConfig } from './config'

let browserClient: ReturnType<typeof createClient> | null = null

export function getBrowserNhost() {
  if (!browserClient) {
    const { subdomain, region } = getPublicNhostConfig()
    browserClient = createClient({
      subdomain,
      region,
      configure: [withClientSideSessionMiddleware],
    })
  }

  return browserClient
}

export async function syncSessionCookie(session: StoredSession | null) {
  await fetch('/api/auth/session', {
    method: session ? 'POST' : 'DELETE',
    headers: session ? { 'Content-Type': 'application/json' } : undefined,
    body: session ? JSON.stringify(session) : undefined,
  })
}

export async function logoutClientSession() {
  const nhost = getBrowserNhost()
  const session = nhost.getUserSession()

  if (session?.refreshToken) {
    try {
      await nhost.auth.signOut({ refreshToken: session.refreshToken })
    } catch {
      // Remote sign-out can fail when the session is already expired; still clear locally.
    }
  }

  nhost.sessionStorage.remove()
  await syncSessionCookie(null)
}
