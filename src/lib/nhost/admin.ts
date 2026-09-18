import { createClient, withAdminSession } from '@nhost/nhost-js'

export function createAdminClient() {
  const subdomain = process.env.NHOST_SUBDOMAIN
  const region = process.env.NHOST_REGION
  const adminSecret =
    process.env.NHOST_ADMIN_SECRET ?? process.env.HASURA_GRAPHQL_ADMIN_SECRET

  if (!subdomain || !region || !adminSecret) {
    throw new Error(
      'Missing Nhost admin env vars. Add NHOST_ADMIN_SECRET to .env.local (from Nhost Dashboard → Settings → Secrets).',
    )
  }

  return createClient({
    subdomain,
    region,
    configure: [
      withAdminSession({
        adminSecret,
      }),
    ],
  })
}
