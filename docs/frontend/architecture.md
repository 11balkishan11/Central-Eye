# Frontend Architecture

## Core Philosophy
The frontend uses a **Vertical Slice Architecture** built with React, Vite, and Tailwind CSS. Instead of organizing files by technical type (all components together, all hooks together), files are organized by business feature (`src/features/*`).

## Tech Stack
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **State Management:**
  - Client State: Zustand (`useAuthStore`)
  - Server State: React Query (`@tanstack/react-query`)
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms:** React Hook Form + Zod
- **API Client:** Axios

## Directory Structure
```
src/
+-- features/        # Business verticals (organizations, sites, devices, auth, dashboard)
+-- shared/          # Cross-cutting concerns (api, hooks, utils, types, ui components)
+-- App.tsx          # Router definition
+-- main.tsx         # Entry point
```

## Routing and Layout
All authenticated routes are wrapped in a `<ProtectedRoute>` and `<AppLayout>`. The `AppLayout` provides the `Sidebar` and `CommandPalette`, ensuring consistent navigation and layout across all feature pages.

