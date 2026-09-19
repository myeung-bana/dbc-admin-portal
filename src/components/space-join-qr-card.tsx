'use client'

import QRCode from 'react-qr-code'
import { toastActionError, toastActionSuccess } from '@/lib/toast/action-feedback'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildStandingJoinUrl, type StandingJoinIntent } from '@/lib/client-app-url'

const JOIN_OPTIONS: Array<{
  intent: StandingJoinIntent
  title: string
  description: string
  recommended?: boolean
}> = [
  {
    intent: 'follow',
    title: 'Follow',
    description: 'See sessions without joining as a member.',
  },
  {
    intent: 'casual',
    title: 'Casual',
    description: 'Join the space and book sessions with pass credits.',
    recommended: true,
  },
  {
    intent: 'member',
    title: 'Member',
    description: 'Join with full member access to book sessions.',
  },
]

type SpaceJoinQrCardProps = {
  slug: string
}

export function SpaceJoinQrCard({ slug }: SpaceJoinQrCardProps) {
  async function copyLink(url: string, label: string) {
    try {
      await navigator.clipboard.writeText(url)
      toastActionSuccess(`${label} copied`)
    } catch {
      toastActionError(`Could not copy ${label.toLowerCase()}`)
    }
  }

  return (
    <Card id="join-qr">
      <CardHeader>
        <CardTitle>Space join links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Print or share these stable links at your venue. Casual is the recommended club-door QR for
          drop-in players.
        </p>
        <div className="grid gap-6 lg:grid-cols-3">
          {JOIN_OPTIONS.map((option) => {
            const url = buildStandingJoinUrl(slug, option.intent)
            return (
              <div key={option.intent} className="space-y-4 rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{option.title}</h3>
                  {option.recommended ? <Badge>Recommended</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{option.description}</p>
                <div className="flex justify-center rounded-xl border bg-white p-4">
                  <QRCode value={url} size={128} />
                </div>
                <p className="break-all text-xs text-muted-foreground">{url}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => void copyLink(url, `${option.title} link`)}
                >
                  Copy link
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
