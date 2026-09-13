import type { StoredSession } from '@nhost/nhost-js'

export const NHOST_SESSION_COOKIE = 'nhost-admin-session'

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
}

export function serializeSessionCookie(session: StoredSession) {
  return JSON.stringify(session)
}

export function parseSessionCookie(raw: string | undefined): StoredSession | null {
  if (!raw) return null

  try {
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

function parseHasuraClaim(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String)
  }

  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    const inner = value.slice(1, -1)
    return inner ? inner.split(',').map((part) => part.trim().replace(/^"(.*)"$/, '$1')) : []
  }

  if (typeof value === 'string') {
    return [value]
  }

  return value
}

export function decodeAccessToken(accessToken: string) {
  const payload = accessToken.split('.')[1]
  if (!payload) return null

  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
  const json = JSON.parse(atob(normalized)) as Record<string, unknown>
  const hasuraClaims = json['https://hasura.io/jwt/claims']

  const decodedHasuraClaims =
    hasuraClaims && typeof hasuraClaims === 'object'
      ? Object.fromEntries(
          Object.entries(hasuraClaims).map(([key, value]) => [key, parseHasuraClaim(value)]),
        )
      : undefined

  return {
    ...json,
    iat: typeof json.iat === 'number' ? json.iat * 1000 : undefined,
    exp: typeof json.exp === 'number' ? json.exp * 1000 : undefined,
    'https://hasura.io/jwt/claims': decodedHasuraClaims,
  }
}

export function withDecodedToken(session: StoredSession): StoredSession {
  const decodedToken = decodeAccessToken(session.accessToken)
  if (!decodedToken) {
    return session
  }

  return { ...session, decodedToken }
}

export function isSessionExpired(session: StoredSession, marginSeconds = 0) {
  const expiresAt = session.decodedToken?.exp
  if (!expiresAt) return true

  return expiresAt <= Date.now() + marginSeconds * 1000
}

export function hasRefreshToken(session: StoredSession | null | undefined) {
  return Boolean(session?.refreshToken)
}

export function getAuthUrl(subdomain: string, region: string) {
  if (subdomain === 'local' && region === 'local') {
    return 'https://local.auth.local.nhost.run/v1'
  }

  return `https://${subdomain}.auth.${region}.nhost.run/v1`
}

export async function refreshStoredSession(
  session: StoredSession,
  subdomain: string,
  region: string,
): Promise<StoredSession | null> {
  if (!session.refreshToken) {
    return null
  }

  const response = await fetch(`${getAuthUrl(subdomain, region)}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  })

  if (!response.ok) {
    return null
  }

  const body = (await response.json()) as StoredSession
  if (!body.accessToken || !body.refreshToken) {
    return null
  }

  return withDecodedToken(body)
}
