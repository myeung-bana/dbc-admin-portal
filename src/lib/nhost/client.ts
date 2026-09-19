'use client'

import {
  createClient,
  withClientSideSessionMiddleware,
  type StoredSession,
} from '@nhost/nhost-js'
import { getPublicNhostConfig } from './config'
import { getAuthUrl, isSessionExpired } from './session-cookie'

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
  const refreshToken = session?.refreshToken

  nhost.sessionStorage.remove()
  await syncSessionCookie(null)

  if (!refreshToken || !session || isSessionExpired(session)) {
    return
  }

  const { subdomain, region } = getPublicNhostConfig()

  try {
    await fetch(`${getAuthUrl(subdomain, region)}/signout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
  } catch {
    // User is already logged out locally.
  }
}
