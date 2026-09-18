const STORAGE_FILE_ID_PATTERN = /\/files\/([0-9a-f-]{36})(?:\?|$)/i

export function extractStorageFileId(avatarUrl: string | null | undefined) {
  if (!avatarUrl) return null

  const match = avatarUrl.match(STORAGE_FILE_ID_PATTERN)
  return match?.[1] ?? null
}

export function getAvatarDisplaySrc(
  avatarUrl: string | null | undefined,
  cacheRevision = 0,
) {
  return getStorageImageSrc(avatarUrl, cacheRevision)
}

export function getStorageImageSrc(
  imageUrl: string | null | undefined,
  cacheRevision = 0,
) {
  if (!imageUrl) return null

  const fileId = extractStorageFileId(imageUrl)
  if (fileId) {
    const base = `/api/avatars/${fileId}`
    if (cacheRevision <= 0) return base
    return `${base}?v=${cacheRevision}`
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    if (cacheRevision <= 0) return imageUrl
    const separator = imageUrl.includes('?') ? '&' : '?'
    return `${imageUrl}${separator}v=${cacheRevision}`
  }

  return null
}
