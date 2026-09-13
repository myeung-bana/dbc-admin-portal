import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CourtDetailForm } from '@/components/court-detail-form'
import { getAdminContext } from '@/lib/admin-context'
import { getCourt, listLocations } from '@/lib/data/master-data'

export default async function CourtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const context = await getAdminContext()
  if (!context.isSuperAdmin) redirect('/dashboard')

  const [courtResult, locationsResult] = await Promise.all([
    getCourt(id),
    listLocations(),
  ])

  const court = courtResult.ok ? courtResult.data.master_courts_by_pk : null
  const locations = locationsResult.ok ? locationsResult.data.master_locations : []

  if (!court) redirect('/master-console/master-data/courts')

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/master-console/master-data/courts" className="hover:underline">
            Courts
          </Link>
          {court.location ? (
            <>
              {' '}
              /{' '}
              <Link
                href={`/master-console/master-data/locations/${court.location.id}`}
                className="hover:underline"
              >
                {court.location.name}
              </Link>
            </>
          ) : null}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">{court.name}</h2>
        <p className="text-muted-foreground">
          {court.location?.name}
          {court.location?.country?.name ? ` · ${court.location.country.name}` : ''}
        </p>
      </div>
      <CourtDetailForm court={court} locations={locations} />
    </div>
  )
}
