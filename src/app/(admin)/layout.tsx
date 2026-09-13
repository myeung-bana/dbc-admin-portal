import { AdminShell } from '@/components/admin-shell'
import { getAdminContext } from '@/lib/admin-context'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const context = await getAdminContext()

  return (
    <AdminShell
      title="Admin"
      user={context.user}
      isSuperAdmin={context.isSuperAdmin}
      viewMode={context.viewMode}
      spaces={context.spaces}
      activeSpaceId={context.activeSpaceId}
    >
      {children}
    </AdminShell>
  )
}
