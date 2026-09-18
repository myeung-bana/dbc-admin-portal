'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { removeSpaceLogoAction, uploadSpaceLogoAction } from '@/app/actions/admin'
import { SpaceLogo } from '@/components/space-logo'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SPACE_LOGO_ACCEPT } from '@/lib/spaces/logo-constants'

type SpaceLogoEditorProps = {
  spaceId: string
  name: string
  initialLogoUrl?: string | null
}

export function SpaceLogoEditor({ spaceId, name, initialLogoUrl }: SpaceLogoEditorProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl ?? null)
  const [logoRevision, setLogoRevision] = useState(0)
  const [uploadPending, startUpload] = useTransition()
  const [removePending, startRemove] = useTransition()

  function onLogoSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.set('logo', file)

    startUpload(async () => {
      const result = await uploadSpaceLogoAction(spaceId, formData)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      setLogoUrl(result.data.logoUrl)
      setLogoRevision((current) => current + 1)
      toast.success('Space logo updated')
      router.refresh()
      event.target.value = ''
    })
  }

  function onRemoveLogo() {
    startRemove(async () => {
      const result = await removeSpaceLogoAction(spaceId)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      setLogoUrl(null)
      setLogoRevision((current) => current + 1)
      toast.success('Space logo removed')
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <Label>Space logo</Label>
      <div className="flex items-center gap-4">
        <SpaceLogo name={name} logoUrl={logoUrl} cacheRevision={logoRevision} size="lg" />
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={SPACE_LOGO_ACCEPT}
            className="hidden"
            onChange={onLogoSelected}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploadPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadPending ? 'Uploading…' : logoUrl ? 'Change logo' : 'Upload logo'}
          </Button>
          {logoUrl ? (
            <Button
              type="button"
              variant="ghost"
              disabled={removePending}
              onClick={onRemoveLogo}
            >
              {removePending ? 'Removing…' : 'Remove'}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
