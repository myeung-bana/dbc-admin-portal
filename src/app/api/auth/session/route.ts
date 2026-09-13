import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  NHOST_SESSION_COOKIE,
  serializeSessionCookie,
  sessionCookieOptions,
  withDecodedToken,
} from '@/lib/nhost/session-cookie'

export async function POST(request: Request) {
  const session = withDecodedToken(await request.json())
  const cookieStore = await cookies()

  cookieStore.set(
    NHOST_SESSION_COOKIE,
    serializeSessionCookie(session),
    sessionCookieOptions,
  )

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(NHOST_SESSION_COOKIE)
  return NextResponse.json({ ok: true })
}
