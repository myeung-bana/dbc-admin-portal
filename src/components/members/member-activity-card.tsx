import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function MemberActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Session bookings and pass usage will appear here in a future update.
        </p>
      </CardContent>
    </Card>
  )
}
