import 'server-only'

import type { NhostClient } from '@nhost/nhost-js'
import { createAdminClient } from '@/lib/nhost/admin'
import { getStorageFileUrl } from '@/lib/nhost/storage'
import { SPACE_LOGO_BUCKET } from '@/lib/spaces/logo-constants'

type UploadResult =
  | { ok: true; logoUrl: string; fileId: string }
  | { ok: false; error: string }

function getProcessedFile(body: unknown) {
  const processedFiles = (body as { processedFiles?: Array<{ id?: string }> })?.processedFiles
  const fileId = processedFiles?.[0]?.id

  if (!fileId) {
    return null
  }

  return fileId
}

async function uploadWithClient(nhost: NhostClient, file: File): Promise<UploadResult> {
  try {
    const { body } = await nhost.storage.uploadFiles({
      'bucket-id': SPACE_LOGO_BUCKET,
      'file[]': [file],
    })

    const fileId = getProcessedFile(body)
    if (!fileId) {
      return { ok: false, error: 'Upload succeeded but no file id was returned' }
    }

    return {
      ok: true,
      fileId,
      logoUrl: getStorageFileUrl(fileId),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload logo'
    return { ok: false, error: message }
  }
}

export async function uploadSpaceLogoFile(
  file: File,
  nhost: NhostClient,
): Promise<UploadResult> {
  const sessionResult = await uploadWithClient(nhost, file)
  if (sessionResult.ok) {
    return sessionResult
  }

  try {
    const admin = createAdminClient()
    return uploadWithClient(admin, file)
  } catch {
    return sessionResult
  }
}
