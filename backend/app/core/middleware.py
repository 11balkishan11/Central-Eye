import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Usually you'd attach this to a contextvar for structured logging
# import contextvars
# request_id_context = contextvars.ContextVar("request_id", default=None)

class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID")
        
        if not request_id or len(request_id) > 50:
            request_id = str(uuid.uuid4())
            
        # Set on request state for use in route handlers / dependencies
        request.state.request_id = request_id
        
        # Attach to context var for loggers (if implemented)
        # request_id_context.set(request_id)
        
        response = await call_next(request)
        
        # Add to response headers
        response.headers["X-Request-ID"] = request_id
        
        return response
