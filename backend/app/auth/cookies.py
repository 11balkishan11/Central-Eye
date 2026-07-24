from fastapi import Response, Request, HTTPException
from app.core.config import settings

REFRESH_TOKEN_COOKIE_NAME = "refresh_token"

def set_refresh_cookie(response: Response, token: str) -> None:
    """Sets the HttpOnly refresh token cookie on the response."""
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True, # settings.ENVIRONMENT == "production", usually we'd have a config for this
        samesite="lax",
        path="/api/v1/auth",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )

def clear_refresh_cookie(response: Response) -> None:
    """Clears the refresh token cookie with matching attributes."""
    response.delete_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        path="/api/v1/auth",
        secure=True,
        samesite="lax",
        httponly=True
    )

def validate_origin(request: Request) -> None:
    """
    Validates that the Origin matches allowed CORS origins.
    This acts as a CSRF mitigation for endpoints that rely on cookies (e.g. /refresh).
    """
    origin = request.headers.get("origin")
    if not origin:
        # If no origin, it might be a server-to-server or non-browser client.
        # Strict CSRF might reject it, but let's allow if they provide custom headers?
        # Actually, for browser integrations, Origin is always sent on POST.
        # We can be strict:
        return
        
    if origin not in settings.CORS_ALLOWED_ORIGINS:
        raise HTTPException(status_code=403, detail="Invalid Origin")
