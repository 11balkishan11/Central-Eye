# ADR 002: Authentication & Refresh Rotation

**Decision**: Use sliding/rotating refresh tokens in HttpOnly cookies to defend against XSS, with server-side validation to prevent token reuse and allow immediate revocation.