# Feature Structure

Each feature vertical (e.g., `src/features/devices`) represents a full slice of functionality and adheres to the following internal structure:

```
src/features/[feature-name]/
+-- README.md           # Business purpose and architectural overview of this specific slice
+-- components/         # Feature-specific components (e.g., DeviceTable, SiteForm)
+-- hooks/              # Feature-specific React Query hooks (e.g., useDevices, useCreateSite)
+-- pages/              # Routed page components (e.g., DevicesPage, DeviceDetailsPage)
+-- schemas/            # Zod validation schemas and TypeScript form definitions
```

## Guiding Principles
- **Colocation**: Anything that is used *only* by this feature should live inside this folder.
- **No Cross-Feature Entanglement**: A feature should not reach into another feature's `components`. If it is shared, it belongs in `src/shared/`.
- **Exception for Data**: A feature *can* use another feature's `hooks` (e.g., `SitesPage` importing `useOrganizations` to populate a dropdown).

