import { redirect } from 'next/navigation'
import { getAdminContext } from '@/lib/admin-context'

export default async function HomePage() {
  const context = await getAdminContext()

  if (context.viewMode === 'space') {
    redirect('/dashboard')
  }

  redirect('/master-console/spaces')
}
