import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getPublicNhostConfig } from '@/lib/nhost/config'
import {
  isSessionExpired,
  NHOST_SESSION_COOKIE,
  parseSessionCookie,
  refreshStoredSession,
  serializeSessionCookie,
  sessionCookieOptions,
} from '@/lib/nhost/session-cookie'

export async function middleware(request: NextRequest) {
  const raw = request.cookies.get(NHOST_SESSION_COOKIE)?.value
  if (!raw) {
    return NextResponse.next()
  }

  const session = parseSessionCookie(raw)
  if (!session?.accessToken) {
    return clearSessionCookie(NextResponse.next())
  }

  if (!isSessionExpired(session, 60)) {
    return NextResponse.next()
  }

  const { subdomain, region } = getPublicNhostConfig()
  const refreshed = await refreshStoredSession(session, subdomain, region)

  if (!refreshed) {
    if (request.nextUrl.pathname.startsWith('/login')) {
      return clearSessionCookie(NextResponse.next())
    }

    const loginUrl = new URL('/login?error=session-expired', request.url)
    return clearSessionCookie(NextResponse.redirect(loginUrl))
  }

  const response = NextResponse.next()
  response.cookies.set(
    NHOST_SESSION_COOKIE,
    serializeSessionCookie(refreshed),
    sessionCookieOptions,
  )

  return response
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(NHOST_SESSION_COOKIE)
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
