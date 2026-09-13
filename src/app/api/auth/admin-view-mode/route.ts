import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ADMIN_VIEW_MODE_COOKIE, type AdminViewMode } from '@/lib/admin-view-mode'
import { ACTIVE_SPACE_COOKIE } from '@/lib/nhost/config'

export async function POST(request: Request) {
  const body = (await request.json()) as {
    mode?: AdminViewMode
    spaceId?: string
  }
  const cookieStore = await cookies()

  if (body.mode !== 'super-admin' && body.mode !== 'space') {
    return NextResponse.json({ ok: false, error: 'Invalid view mode' }, { status: 400 })
  }

  cookieStore.set(ADMIN_VIEW_MODE_COOKIE, body.mode, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  if (body.mode === 'space' && body.spaceId) {
    cookieStore.set(ACTIVE_SPACE_COOKIE, body.spaceId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
  }

  return NextResponse.json({ ok: true })
}
