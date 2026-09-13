import { LoginForm } from './login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const initialError =
    params.error === 'unauthorized'
      ? 'Your account does not have admin access.'
      : params.error === 'no-space'
        ? 'You do not belong to any active space yet.'
        : params.error === 'session-expired'
          ? 'Your session expired. Please sign in again.'
          : null

  return <LoginForm initialError={initialError} />
}
