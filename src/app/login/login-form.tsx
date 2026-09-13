'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getBrowserNhost, logoutClientSession, syncSessionCookie } from '@/lib/nhost/client'
import { getPostLoginPath, getUserRolesFromSession, hasAdminPortalAccess } from '@/lib/nhost/roles'

export function LoginForm({ initialError }: { initialError?: string | null }) {
  const [email, setEmail] = useState('superadmin@dbc.local')
  const [password, setPassword] = useState('Admin12345!')
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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>DBC Admin Portal</CardTitle>
          <CardDescription>Sign in as Super Admin or Organiser.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
