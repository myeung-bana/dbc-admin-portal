import { requireSuperAdminView } from '@/lib/admin-context'

export default async function MasterConsoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireSuperAdminView()
  return children
}
