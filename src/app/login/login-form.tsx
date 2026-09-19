'use client'

import { useEffect, useState } from 'react'
import { AuthBrandPanel } from '@/app/login/auth-brand-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getBrowserNhost, logoutClientSession, syncSessionCookie } from '@/lib/nhost/client'
import { ADMIN_APP_NAME } from '@/lib/brand'
import { getPostLoginPath, getUserRolesFromSession, hasAdminPortalAccess } from '@/lib/nhost/roles'

const devDefaults =
  process.env.NODE_ENV === 'development'
    ? { email: 'superadmin@dbc.local', password: 'Admin12345!' }
    : { email: '', password: '' }

export function LoginForm({ initialError }: { initialError?: string | null }) {
  const [email, setEmail] = useState(devDefaults.email)
  const [password, setPassword] = useState(devDefaults.password)
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void syncSessionCookie(null)
    getBrowserNhost().sessionStorage.remove()
  }, [])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await syncSessionCookie(null)

      const nhost = getBrowserNhost()
      nhost.sessionStorage.remove()
      const { body } = await nhost.auth.signInEmailPassword({
        email,
        password,
      })

      if (!body?.session) {
        setError('Login failed')
        return
      }

      nhost.sessionStorage.set(body.session)
      const session = nhost.getUserSession()

      if (!session) {
        setError('Login failed')
        return
      }

      const roles = getUserRolesFromSession(session)

      if (!hasAdminPortalAccess(roles)) {
        await logoutClientSession()
        setError('This account does not have Super Admin or Organiser access.')
        return
      }

      await syncSessionCookie(session)
      window.location.assign(getPostLoginPath(roles) ?? '/dashboard')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err && 'message' in err
            ? String(err.message)
            : 'Login failed',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <main className="flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="mb-8 w-full max-w-md lg:hidden">
          <p className="text-sm font-medium text-muted-foreground">Gachi</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{ADMIN_APP_NAME}</h1>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 hidden lg:block">
            <p className="text-sm font-medium text-muted-foreground">Gachi</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{ADMIN_APP_NAME}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in as Super Admin or Organiser.
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error ? (
              <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </main>

      <AuthBrandPanel />
    </div>
  )
}
