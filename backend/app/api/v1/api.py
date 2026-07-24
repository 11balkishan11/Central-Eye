from fastapi import APIRouter
from app.api.v1.endpoints import health, organizations, sites, invitations, devices, lookups, auth

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])
api_router.include_router(sites.router, prefix="/organizations/{org_id}/sites", tags=["Sites"])
api_router.include_router(sites.router, prefix="/sites", tags=["Sites"]) # For endpoints that don't need org_id in path (like GET by ID, PATCH, DELETE)
api_router.include_router(invitations.router, tags=["Invitations"])
api_router.include_router(devices.router, prefix="/devices", tags=["Devices"])
api_router.include_router(lookups.router, tags=["Lookups"])
