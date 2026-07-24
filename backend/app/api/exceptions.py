from fastapi import Request, FastAPI, status
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.auth.auth_service import AuthenticationError, AccountLockedError
from app.auth.exceptions import (
    SessionRevokedError, 
    SessionExpiredError, 
    RefreshReuseDetectedError,
    InvalidRefreshTokenError
)
# from app.api.dependencies import AuthorizationError  # If we have an RBAC error

def create_error_response(request: Request, status_code: int, code: str, message: str) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "unknown")
    content = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "request_id": request_id
        }
    }
    
    headers = {}
    if status_code == 401:
        headers["WWW-Authenticate"] = "Bearer"
        
    return JSONResponse(
        status_code=status_code,
        content=content,
        headers=headers
    )

def setup_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AuthenticationError)
    async def auth_error_handler(request: Request, exc: AuthenticationError):
        return create_error_response(
            request, 
            status.HTTP_401_UNAUTHORIZED, 
            "AUTH_INVALID_CREDENTIALS", 
            str(exc)
        )

    @app.exception_handler(AccountLockedError)
    async def account_locked_handler(request: Request, exc: AccountLockedError):
        return create_error_response(
            request, 
            status.HTTP_423_LOCKED, 
            "AUTH_ACCOUNT_LOCKED", 
            str(exc)
        )

    @app.exception_handler(SessionRevokedError)
    async def session_revoked_handler(request: Request, exc: SessionRevokedError):
        return create_error_response(
            request, 
            status.HTTP_401_UNAUTHORIZED, 
            "AUTH_SESSION_REVOKED", 
            "Session has been revoked."
        )

    @app.exception_handler(SessionExpiredError)
    async def session_expired_handler(request: Request, exc: SessionExpiredError):
        return create_error_response(
            request, 
            status.HTTP_401_UNAUTHORIZED, 
            "AUTH_SESSION_EXPIRED", 
            "Session has expired."
        )

    @app.exception_handler(RefreshReuseDetectedError)
    async def refresh_reuse_handler(request: Request, exc: RefreshReuseDetectedError):
        return create_error_response(
            request, 
            status.HTTP_401_UNAUTHORIZED, 
            "AUTH_REUSE_DETECTED", 
            "Token reuse detected. Session compromised."
        )

    @app.exception_handler(InvalidRefreshTokenError)
    async def invalid_refresh_handler(request: Request, exc: InvalidRefreshTokenError):
        return create_error_response(
            request, 
            status.HTTP_401_UNAUTHORIZED, 
            "AUTH_INVALID_TOKEN", 
            "Invalid token."
        )

    # Generic FastAPI HTTP exceptions
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        # We can map standard FastAPI errors (e.g. 404, 422) into our standard envelope
        return create_error_response(
            request, 
            exc.status_code, 
            f"HTTP_{exc.status_code}", 
            str(exc.detail)
        )
