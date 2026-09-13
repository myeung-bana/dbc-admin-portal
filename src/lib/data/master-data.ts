import 'server-only'

import { adminGqlRequest } from '@/lib/graphql'
import type {
  CountryInput,
  CourtInput,
  LocationInput,
} from '@/lib/schemas/master-data.schema'
import type { MasterCourt, MasterCountry, MasterLocation } from '@/lib/types'

type CountryListItem = MasterCountry & {
  locations_aggregate: { aggregate: { count: number } | null }
}

type LocationListItem = MasterLocation & {
  courts_aggregate: { aggregate: { count: number } | null }
}

export async function listCountries() {
  return adminGqlRequest<{ master_countries: CountryListItem[] }>(
    `
      query ListCountries {
        master_countries(order_by: { name: asc }) {
          id
          name
          code
          locations_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    `,
  )
}

export async function getCountry(countryId: string) {
  return adminGqlRequest<{ master_countries_by_pk: MasterCountry | null }>(
    `
      query GetCountry($id: uuid!) {
        master_countries_by_pk(id: $id) {
          id
          name
          code
        }
      }
    `,
    { id: countryId },
  )
}

export async function listLocationsByCountry(countryId: string) {
  return adminGqlRequest<{ master_locations: MasterLocation[] }>(
    `
      query LocationsByCountry($countryId: uuid!) {
        master_locations(
          where: { country_id: { _eq: $countryId } }
          order_by: { name: asc }
        ) {
          id
          name
          address
          country { id name code }
        }
      }
    `,
    { countryId },
  )
}

export async function listLocations() {
  return adminGqlRequest<{ master_locations: LocationListItem[] }>(
    `
      query ListLocations {
        master_locations(order_by: { name: asc }) {
          id
          name
          address
          country { id name code }
          courts_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    `,
  )
}

export async function getLocation(locationId: string) {
  return adminGqlRequest<{ master_locations_by_pk: MasterLocation | null }>(
    `
      query GetLocation($id: uuid!) {
        master_locations_by_pk(id: $id) {
          id
          name
          address
          country { id name code }
        }
      }
    `,
    { id: locationId },
  )
}

export async function listCourtsByLocation(locationId: string) {
  return adminGqlRequest<{ master_courts: MasterCourt[] }>(
    `
      query CourtsByLocation($locationId: uuid!) {
        master_courts(
          where: { location_id: { _eq: $locationId } }
          order_by: { name: asc }
        ) {
          id
          name
          location { id name }
        }
      }
    `,
    { locationId },
  )
}

export async function listCourts() {
  return adminGqlRequest<{ master_courts: MasterCourt[] }>(
    `
      query ListCourts {
        master_courts(order_by: { name: asc }) {
          id
          name
          location { id name country { id name } }
        }
      }
    `,
  )
}

export async function getCourt(courtId: string) {
  return adminGqlRequest<{ master_courts_by_pk: MasterCourt | null }>(
    `
      query GetCourt($id: uuid!) {
        master_courts_by_pk(id: $id) {
          id
          name
          location { id name country { id name } }
        }
      }
    `,
    { id: courtId },
  )
}

export async function createCountry(input: CountryInput) {
  return adminGqlRequest<{ insert_master_countries_one: MasterCountry }>(
    `
      mutation CreateCountry($object: master_countries_insert_input!) {
        insert_master_countries_one(object: $object) {
          id
          name
          code
        }
      }
    `,
    { object: input },
  )
}

export async function updateCountry(countryId: string, input: CountryInput) {
  return adminGqlRequest<{ update_master_countries_by_pk: MasterCountry }>(
    `
      mutation UpdateCountry($id: uuid!, $set: master_countries_set_input!) {
        update_master_countries_by_pk(pk_columns: { id: $id }, _set: $set) {
          id
          name
          code
        }
      }
    `,
    { id: countryId, set: input },
  )
}

export async function createLocation(input: LocationInput) {
  return adminGqlRequest<{ insert_master_locations_one: MasterLocation }>(
    `
      mutation CreateLocation($object: master_locations_insert_input!) {
        insert_master_locations_one(object: $object) {
          id
          name
          address
          country { id name code }
        }
      }
    `,
    {
      object: {
        name: input.name,
        country_id: input.countryId,
        address: input.address ?? null,
      },
    },
  )
}

export async function updateLocation(locationId: string, input: LocationInput) {
  return adminGqlRequest<{ update_master_locations_by_pk: MasterLocation }>(
    `
      mutation UpdateLocation($id: uuid!, $set: master_locations_set_input!) {
        update_master_locations_by_pk(pk_columns: { id: $id }, _set: $set) {
          id
          name
          address
          country { id name code }
        }
      }
    `,
    {
      id: locationId,
      set: {
        name: input.name,
        country_id: input.countryId,
        address: input.address ?? null,
      },
    },
  )
}

export async function createCourt(input: CourtInput) {
  return adminGqlRequest<{ insert_master_courts_one: MasterCourt }>(
    `
      mutation CreateCourt($object: master_courts_insert_input!) {
        insert_master_courts_one(object: $object) {
          id
          name
          location { id name }
        }
      }
    `,
    {
      object: {
        name: input.name,
        location_id: input.locationId,
      },
    },
  )
}

export async function updateCourt(courtId: string, input: CourtInput) {
  return adminGqlRequest<{ update_master_courts_by_pk: MasterCourt }>(
    `
      mutation UpdateCourt($id: uuid!, $set: master_courts_set_input!) {
        update_master_courts_by_pk(pk_columns: { id: $id }, _set: $set) {
          id
          name
          location { id name country { id name } }
        }
      }
    `,
    {
      id: courtId,
      set: {
        name: input.name,
        location_id: input.locationId,
      },
    },
  )
}
