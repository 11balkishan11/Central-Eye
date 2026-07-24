# Authentication

Authentication relies on JWT Access Tokens stored in memory (via Zustand `persist` to LocalStorage) and Refresh Tokens stored securely in HttpOnly cookies managed by the backend.

## Flow
1. **Login (`/auth/login`)**: Client sends email/password. Backend verifies, sets `HttpOnly` refresh cookie, and returns an `access_token` with user details.
2. **Store (`useAuthStore`)**: The `access_token` and `user` are stored in Zustand.
3. **Protected Routes (`<ProtectedRoute>`)**: Validates the presence of `token`. On full page reload, it reaches out to `/auth/me` to verify the session before rendering the underlying component, preventing flicker and ensuring session validity.
4. **Token Expiry**: Handled seamlessly by Axios response interceptors. A `401` triggers an automated `/auth/refresh` request utilizing the HttpOnly cookie. If successful, the failed request is replayed. If failed, the user is logged out.
5. **Logout (`/auth/logout`)**: Calls the backend to revoke the session and wipe the HttpOnly cookie, while the client clears the Zustand store.

