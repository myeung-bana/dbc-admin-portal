import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CountryDetailTabs } from '@/components/country-detail-tabs'
import { getAdminContext } from '@/lib/admin-context'
import { getCountry, listLocationsByCountry } from '@/lib/data/master-data'

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const context = await getAdminContext()
  if (!context.isSuperAdmin) redirect('/dashboard')

  const [countryResult, locationsResult] = await Promise.all([
    getCountry(id),
    listLocationsByCountry(id),
  ])

  const country = countryResult.ok ? countryResult.data.master_countries_by_pk : null
  const locations = locationsResult.ok ? locationsResult.data.master_locations : []

  if (!country) redirect('/master-console/master-data/countries')

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/master-console/master-data/countries" className="hover:underline">
            Countries
          </Link>
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">{country.name}</h2>
        <p className="text-muted-foreground">{country.code}</p>
      </div>
      <CountryDetailTabs country={country} locations={locations} />
    </div>
  )
}
