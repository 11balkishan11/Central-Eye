# Design System

NS3 Central emphasizes a highly polished, enterprise-grade aesthetic leveraging Tailwind CSS, Lucide icons, and Shadcn UI.

## Components
Base UI components are located in `src/shared/components/ui/`.
Instead of adopting heavy libraries like Storybook early on, we maintain a `/design-system` route that acts as an internal playground and living style guide.

## Enterprise States
All data tables and interactive views must implement comprehensive states:
- **Loading State:** Skeletons or `Loader2` centered states.
- **Empty State:** Uses the shared `<EmptyState>` component indicating what is missing and offering a primary action to resolve it (e.g., "Add Site").
- **Error State:** Uses the shared `<ErrorState>` component catching failed queries and allowing users to retry.

