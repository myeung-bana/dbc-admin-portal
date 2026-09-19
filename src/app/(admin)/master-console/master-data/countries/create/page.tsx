import { redirect } from 'next/navigation'
import { CreateCountryForm } from '@/components/master-data/create-forms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminContext } from '@/lib/admin-context'

export default async function CreateCountryPage() {
  const context = await getAdminContext()
  if (!context.isSuperAdmin) redirect('/dashboard')

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Create country</h2>
        <p className="text-muted-foreground">Add a new country to the master data taxonomy.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Country details</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateCountryForm />
        </CardContent>
      </Card>
    </div>
  )
}
