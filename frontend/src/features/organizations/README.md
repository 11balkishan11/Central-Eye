# Organizations Feature

## Purpose
Manages multi-tenant organizations within the platform. Organizations are the top-level entity that owns sites and devices.

## API
Uses `organizationApi` from `src/shared/api/organizationApi.ts`.

## Hooks
- `useOrganizations`: Fetches paginated list of organizations.
- `useOrganization`: Fetches a single organization by ID.
- `useCreateOrganization`: Mutation to create an organization.
- `useUpdateOrganization`: Mutation to update an organization.
- `useDeleteOrganization`: Mutation to delete an organization.

## Components
- `OrganizationsPage`: Main page listing organizations with data table.
- `OrganizationForm`: Shared form using Zod for create/edit.
- `CreateOrganizationDialog`: Dialog wrapping the form for creation.
- `EditOrganizationDialog`: Dialog wrapping the form for editing.
- `DeleteOrganizationDialog`: Confirmation dialog for deletion.

## Flow
1. User navigates to `/organizations`.
2. `OrganizationsPage` fetches data via `useOrganizations`.
3. User can click "Create" to open `CreateOrganizationDialog`.
4. User can search/sort/paginate the data table.
5. Actions dropdown in table allows Edit and Delete.

