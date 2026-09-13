import type { NhostClient } from '@nhost/nhost-js'
import { getGraphqlRole, getUserRolesFromSession } from '@/lib/nhost/roles'
import { requireServerSession } from '@/lib/nhost/server'

type GraphqlResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; details?: unknown }

function formatGraphqlError(message: string) {
  if (message.includes("field 'spaces' not found in type: 'query_root'")) {
    return 'The Nhost backend schema is not deployed yet. Push dbc-nhost migrations and metadata to your cloud project, then try again.'
  }

  if (message.includes('JWTExpired') || message.includes('Could not verify JWT')) {
    return 'Your session has expired. Please sign in again.'
  }

  return message
}

export async function gqlRequest<T>(
  nhost: NhostClient,
  query: string,
  variables?: Record<string, unknown>,
  role?: string,
): Promise<GraphqlResult<T>> {
  const { body } = await nhost.graphql.request(
    { query, variables },
    role ? { headers: { 'x-hasura-role': role } } : undefined,
  )

  if (body.errors?.length) {
    const message = body.errors[0]?.message ?? 'GraphQL request failed'
    return {
      ok: false,
      error: formatGraphqlError(message),
      details: body.errors,
    }
  }

  return { ok: true, data: body.data as T }
}

export async function adminGqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<GraphqlResult<T>> {
  const auth = await requireServerSession()
  if (!auth.ok) {
    return {
      ok: false,
      error:
        auth.reason === 'expired'
          ? 'Your session has expired. Please sign in again.'
          : 'Unauthorized',
    }
  }

  const role = getGraphqlRole(getUserRolesFromSession(auth.session))
  if (!role) {
    return { ok: false, error: 'Unauthorized' }
  }

  return gqlRequest<T>(auth.nhost, query, variables, role)
}

export async function callAdminFunction<T>(
  nhost: NhostClient,
  path: string,
  payload: Record<string, unknown>,
): Promise<GraphqlResult<T>> {
  const { body: json } = await nhost.functions.post<{
    ok: boolean
    data?: T
    error?: string
    details?: unknown
  }>(path, payload)

  if (!json.ok) {
    return {
      ok: false,
      error: json.error ?? 'Function call failed',
      details: json.details,
    }
  }

  return { ok: true, data: json.data as T }
}
