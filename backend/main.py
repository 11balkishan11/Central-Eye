from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Any

from app.api.v1.api import api_router
from app.api.exceptions import setup_exception_handlers

app = FastAPI(
    title="Central Eye API",
    version="0.1.0",
    description="AI Native Autonomous IT Operations Platform",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
setup_exception_handlers(app)

# Routers
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check() -> Any:
    return {"status": "ok", "message": "Backend is running"}

@app.get("/")
async def root():
    return RedirectResponse(url="/api/v1/docs")

@app.get("/docs")
async def docs_redirect():
    return RedirectResponse(url="/api/v1/docs")
