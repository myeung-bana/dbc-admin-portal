import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ACTIVE_SPACE_COOKIE } from '@/lib/nhost/config'

export async function POST(request: Request) {
  const { spaceId } = (await request.json()) as { spaceId?: string }
  const cookieStore = await cookies()

  if (!spaceId) {
    cookieStore.delete(ACTIVE_SPACE_COOKIE)
    return NextResponse.json({ ok: true })
  }

  cookieStore.set(ACTIVE_SPACE_COOKIE, spaceId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return NextResponse.json({ ok: true })
}
