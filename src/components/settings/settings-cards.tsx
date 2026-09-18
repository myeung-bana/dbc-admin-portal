import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium sm:text-right">{value}</dd>
    </div>
  )
}

type AccountSettingsCardProps = {
  name: string
  email: string
  roles: string[]
}

export function AccountSettingsCard({ name, email, roles }: AccountSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your account</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <DetailRow label="Name" value={name} />
          <DetailRow label="Email" value={email || '—'} />
          <DetailRow
            label="Roles"
            value={
              roles.length > 0 ? (
                <div className="flex flex-wrap justify-end gap-2">
                  {roles.map((role) => (
                    <Badge key={role}>{role}</Badge>
                  ))}
                </div>
              ) : (
                '—'
              )
            }
          />
        </dl>
      </CardContent>
    </Card>
  )
}
