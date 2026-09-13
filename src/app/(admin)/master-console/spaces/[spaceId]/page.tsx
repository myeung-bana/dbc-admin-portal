import { redirect } from 'next/navigation'
import { SpaceDetailTabs } from '@/components/space-detail-tabs'
import { getAdminContext } from '@/lib/admin-context'
import { getSpace, listSpaceMemberships } from '@/lib/data/spaces'

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ spaceId: string }>
}) {
  const { spaceId } = await params
  const context = await getAdminContext()
  if (!context.isSuperAdmin) redirect('/dashboard')

  const [spaceResult, membershipsResult] = await Promise.all([
    getSpace(spaceId),
    listSpaceMemberships(spaceId),
  ])

  const space = spaceResult.ok ? spaceResult.data.spaces_by_pk : null
  const memberships = membershipsResult.ok ? membershipsResult.data.space_memberships : []

  if (!space) redirect('/master-console/spaces')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{space.name}</h2>
        <p className="text-muted-foreground">{space.slug}</p>
      </div>
      <SpaceDetailTabs space={space} memberships={memberships} />
    </div>
  )
}
