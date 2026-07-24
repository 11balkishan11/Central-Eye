# Sites Feature

## Purpose
Manages physical or logical sites within an organization. Devices are deployed into sites.

## API
Uses `siteApi` from `src/shared/api/siteApi.ts`.

## Hooks
- `useSites`: Fetches paginated list of sites (optionally filtered by org).
- `useSite`: Fetches a single site by ID.
- `useCreateSite`: Mutation to create a site.
- `useUpdateSite`: Mutation to update a site.
- `useDeleteSite`: Mutation to delete a site.

## Components
- `SitesPage`: Main page listing sites with data table.
- `SiteForm`: Shared form using Zod for create/edit.
- `CreateSiteDialog`: Dialog wrapping the form for creation.
- `EditSiteDialog`: Dialog wrapping the form for editing.
- `DeleteSiteDialog`: Confirmation dialog for deletion.

## Flow
1. User navigates to `/sites`.
2. `SitesPage` fetches data via `useSites`.
3. User can search, sort, and filter by Organization.
4. User can click "Create" to open `CreateSiteDialog`.
5. Actions dropdown in table allows Edit and Delete.

