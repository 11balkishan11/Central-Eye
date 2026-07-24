# Devices Feature

## Purpose
Manages the inventory of network devices and the device provisioning wizard.

## API
Uses `deviceApi` and `lookupApi` from `src/shared/api`.

## Hooks
- `useDevices`: Fetches paginated list of devices.
- `useDevice`: Fetches single device by ID.
- `useCreateDevice`: Mutation to provision a device.
- `useDeleteDevice`: Mutation to delete a device.
- `useLookups`: React Query hooks for fetching vendors, collectors, credentials, etc.

## Components
- `DevicesPage`: Enterprise data table with rich columns (CPU, Memory, Health, etc).
- `DeviceDetailsPage`: Deep dive into a single device.
- `DeviceProvisionWizard`: Multi-step wizard to onboard a new device.

## Flow
1. User navigates to `/devices`.
2. `DevicesPage` shows the rich enterprise table.
3. User clicks "Provision Device" to open wizard.
4. Wizard uses `ProvisionWizardProvider` (React Context) and persists progress to `localStorage`.
5. Wizard validates each step with Zod.
6. Wizard submits payload matching backend expectations.

