import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/nhost/admin'
import { requireServerSession } from '@/lib/nhost/server'
import { getStorageFileUrl } from '@/lib/nhost/storage'

type RouteContext = {
  params: Promise<{ fileId: string }>
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(_request: Request, context: RouteContext) {
  const { fileId } = await context.params

  if (!UUID_PATTERN.test(fileId)) {
    return NextResponse.json({ error: 'Invalid file id' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()
    const { body } = await admin.storage.getFilePresignedURL(fileId)
    if (body.url) {
      return NextResponse.redirect(body.url, { status: 307 })
    }
  } catch {
    // Fall through to session presigned URL / public fetch.
  }

  const auth = await requireServerSession()
  if (auth.ok) {
    try {
      const { body } = await auth.nhost.storage.getFilePresignedURL(fileId)
      if (body.url) {
        return NextResponse.redirect(body.url, { status: 307 })
      }
    } catch {
      // Fall through to public fetch.
    }
  }

  const storageUrl = getStorageFileUrl(fileId)
  const storageResponse = await fetch(storageUrl, { cache: 'no-store' })

  if (!storageResponse.ok || !storageResponse.body) {
    return NextResponse.json({ error: 'Avatar not found' }, { status: 404 })
  }

  const headers = new Headers()
  headers.set(
    'Content-Type',
    storageResponse.headers.get('content-type') ?? 'application/octet-stream',
  )
  headers.set('Cache-Control', 'private, max-age=3600')

  return new NextResponse(storageResponse.body, {
    status: 200,
    headers,
  })
}
