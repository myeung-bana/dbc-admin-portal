export function getClientAppUrl() {
  const configured = process.env.NEXT_PUBLIC_CLIENT_APP_URL?.replace(/\/$/, '')
  if (configured) {
    return configured
  }

  return 'http://localhost:3001'
}

export function buildJoinInviteUrl(code: string) {
  const base = getClientAppUrl()
  return `${base}/join?code=${encodeURIComponent(code)}`
}
