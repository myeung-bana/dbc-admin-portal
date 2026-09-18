import { getPublicNhostConfig } from '@/lib/nhost/config'

export function getStorageFileUrl(fileId: string) {
  const { subdomain, region } = getPublicNhostConfig()

  if (subdomain === 'local' && region === 'local') {
    return `https://local.storage.local.nhost.run/v1/files/${fileId}`
  }

  return `https://${subdomain}.storage.${region}.nhost.run/v1/files/${fileId}`
}
