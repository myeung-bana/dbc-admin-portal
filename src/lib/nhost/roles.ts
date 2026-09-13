import type { StoredSession } from '@nhost/nhost-js'

export function getUserRolesFromSession(session: StoredSession | null | undefined) {
  const claims = session?.decodedToken?.['https://hasura.io/jwt/claims'] as
    | Record<string, unknown>
    | undefined
  const allowedRoles = claims?.['x-hasura-allowed-roles']

  if (Array.isArray(allowedRoles)) {
    return allowedRoles.map(String)
  }

  if (typeof allowedRoles === 'string') {
    return [allowedRoles]
  }

  return []
}

export function isSuperAdmin(roles: string[]) {
  return roles.includes('super_admin')
}

export function isOrganiserRole(roles: string[]) {
  return roles.includes('organiser')
}

export function hasAdminPortalAccess(roles: string[]) {
  return isSuperAdmin(roles) || isOrganiserRole(roles)
}

export function isOrganiser(roles: string[]) {
  return isOrganiserRole(roles) || isSuperAdmin(roles)
}

export function getPostLoginPath(roles: string[]) {
  if (isSuperAdmin(roles)) {
    return '/master-console/spaces'
  }

  if (isOrganiserRole(roles)) {
    return '/dashboard'
  }

  return null
}

export function getGraphqlRole(roles: string[]) {
  if (isSuperAdmin(roles)) {
    return 'super_admin'
  }

  if (isOrganiserRole(roles)) {
    return 'organiser'
  }

  return null
}
