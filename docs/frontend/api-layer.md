# API Layer

The frontend communicates with the backend via Axios and React Query.

## Axios Instance (`src/shared/api/axios.ts`)
We use a customized Axios instance that:
- Sets the `baseURL` to `VITE_API_URL`.
- Enforces a 10s timeout.
- Enables `withCredentials: true` to allow HttpOnly cookies (required for Refresh Tokens).

## Interceptors (`src/shared/api/interceptors.ts`)
1. **Request Interceptor:** Automatically attaches the `Bearer` token from `useAuthStore` to every outbound request.
2. **Response Interceptor:** 
   - Catches `401 Unauthorized`. If it is not a retry and not an auth route, it pauses the request queue, calls `/auth/refresh` to get a new token via the HttpOnly cookie, updates the Zustand store, and replays the failed requests.
   - Maps backend error schemas into a unified `ApiError` format.
   - Automatically toasts user-facing messages for `403` and `500` errors.

## React Query
Feature-specific hooks wrap Axios calls (`siteApi.getAll`, `deviceApi.create`) inside `useQuery` and `useMutation`.
Query keys are centralized in each feature folder (e.g., `deviceKeys.list()`) for structured cache invalidation.

