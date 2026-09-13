export type AdminViewMode = 'super-admin' | 'space'

export const ADMIN_VIEW_MODE_COOKIE = 'dbc-admin-view-mode'

export function resolveAdminViewMode(
  isSuperAdmin: boolean,
  cookieValue?: string | null,
): AdminViewMode {
  if (!isSuperAdmin) {
    return 'space'
  }

  return cookieValue === 'space' ? 'space' : 'super-admin'
}

export function isSuperAdminRoute(pathname: string) {
  return pathname === '/master-console' || pathname.startsWith('/master-console/')
}

export function isSpaceRoute(pathname: string) {
  return (
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname.startsWith('/members')
  )
}
