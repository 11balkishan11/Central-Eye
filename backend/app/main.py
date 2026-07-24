from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.middleware import RequestIdMiddleware
from app.api.exceptions import setup_exception_handlers
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.api import api_router

app = FastAPI(title="Central Eye API", version="1.0.0")

app.add_middleware(RequestIdMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # For local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_exception_handlers(app)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok"}
