import {
  createServerClient,
  type NhostClient,
  type StoredSession,
} from '@nhost/nhost-js'
import { cookies } from 'next/headers'
import { ADMIN_VIEW_MODE_COOKIE } from '@/lib/admin-view-mode'
import { ACTIVE_SPACE_COOKIE, getPublicNhostConfig } from './config'
import {
  hasRefreshToken,
  isSessionExpired,
  NHOST_SESSION_COOKIE,
  parseSessionCookie,
} from './session-cookie'
import {
  getUserRolesFromSession,
  isOrganiser,
  isSuperAdmin,
} from './roles'

type ServerSessionResult =
  | { ok: true; nhost: NhostClient; session: StoredSession }
  | { ok: false; reason: 'missing' | 'expired' }

export async function getServerNhost() {
  const cookieStore = await cookies()
  const { subdomain, region } = getPublicNhostConfig()

  return createServerClient({
    subdomain,
    region,
    storage: {
      get: (): StoredSession | null => {
        return parseSessionCookie(cookieStore.get(NHOST_SESSION_COOKIE)?.value)
      },
      set: () => {
        // Cookie writes are handled by route handlers and middleware only.
      },
      remove: () => {
        // Cookie writes are handled by route handlers and middleware only.
      },
    },
  })
}

export async function requireServerSession(): Promise<ServerSessionResult> {
  const nhost = await getServerNhost()
  const hadStoredSession = Boolean(nhost.getUserSession())
  const session = nhost.getUserSession()

  if (!session?.accessToken || !hasRefreshToken(session)) {
    return { ok: false, reason: hadStoredSession ? 'expired' : 'missing' }
  }

  if (isSessionExpired(session, 60)) {
    return { ok: false, reason: 'expired' }
  }

  return { ok: true, nhost, session }
}

export async function getActiveSpaceId() {
  const cookieStore = await cookies()
  return cookieStore.get(ACTIVE_SPACE_COOKIE)?.value ?? null
}

export async function getAdminViewModeCookie() {
  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_VIEW_MODE_COOKIE)?.value ?? null
}

export async function getUserRoles(session: StoredSession) {
  return getUserRolesFromSession(session)
}

export { isOrganiser, isSuperAdmin }
