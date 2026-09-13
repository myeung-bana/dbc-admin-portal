export const NHOST_SESSION_COOKIE = 'nhost-admin-session'
export const ACTIVE_SPACE_COOKIE = 'dbc-active-space-id'

export function getPublicNhostConfig() {
  const subdomain = process.env.NHOST_SUBDOMAIN ?? 'local'
  const region = process.env.NHOST_REGION ?? 'local'

  return { subdomain, region }
}
