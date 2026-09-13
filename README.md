# dbc-admin-portal

Super Admin and Organiser portal for DBC Booking.

## Stack

- Next.js 16 (App Router)
- shadcn/ui dashboard layout
- Nhost Auth + GraphQL + Functions

## Setup

```bash
npm install --cache ./.npm-cache
cp .env.example .env.local
```

Use `local/local` when running the backend with `nhost up`, or your cloud subdomain/region.

Start the backend from `../dbc-nhost`:

```bash
cd ../dbc-nhost
nhost up --apply-seeds
```

Then start the admin portal:

```bash
npm run dev
```

Open http://localhost:3000 and sign in with the seeded Super Admin:

- Email: `superadmin@dbc.local`
- Password: `Admin12345!`

## Routes

- `/login`
- `/dashboard`, `/dashboard/sessions`, `/dashboard/sessions/import`, `/dashboard/settings`
- `/members`
- `/master-console/spaces`, `/master-console/master-data/{countries,locations,courts}` with list, create, and detail routes (Master Console only)
