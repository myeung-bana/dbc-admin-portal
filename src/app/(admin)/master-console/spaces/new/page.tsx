import { redirect } from 'next/navigation'
import { CreateSpaceForm } from '@/components/create-space-form'
import { getAdminContext } from '@/lib/admin-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function NewSpacePage() {
  const context = await getAdminContext()
  if (!context.isSuperAdmin) redirect('/dashboard')

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Create space</h2>
        <p className="text-muted-foreground">
          Provision a new space and assign its first organiser.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Space details</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateSpaceForm />
        </CardContent>
      </Card>
    </div>
  )
}
