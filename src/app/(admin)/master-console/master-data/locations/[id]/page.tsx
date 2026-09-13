import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LocationDetailTabs } from '@/components/location-detail-tabs'
import { getAdminContext } from '@/lib/admin-context'
import {
  getLocation,
  listCountries,
  listCourtsByLocation,
} from '@/lib/data/master-data'

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const context = await getAdminContext()
  if (!context.isSuperAdmin) redirect('/dashboard')

  const [locationResult, countriesResult, courtsResult] = await Promise.all([
    getLocation(id),
    listCountries(),
    listCourtsByLocation(id),
  ])

  const location = locationResult.ok ? locationResult.data.master_locations_by_pk : null
  const countries = countriesResult.ok ? countriesResult.data.master_countries : []
  const courts = courtsResult.ok ? courtsResult.data.master_courts : []

  if (!location) redirect('/master-console/master-data/locations')

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/master-console/master-data/locations" className="hover:underline">
            Locations
          </Link>
          {location.country ? (
            <>
              {' '}
              /{' '}
              <Link
                href={`/master-console/master-data/countries/${location.country.id}`}
                className="hover:underline"
              >
                {location.country.name}
              </Link>
            </>
          ) : null}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">{location.name}</h2>
        <p className="text-muted-foreground">{location.address ?? location.country?.name}</p>
      </div>
      <LocationDetailTabs location={location} countries={countries} courts={courts} />
    </div>
  )
}
