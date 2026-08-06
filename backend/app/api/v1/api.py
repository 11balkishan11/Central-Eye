from fastapi import APIRouter
from app.api.v1.endpoints import (
    health, organizations, sites, invitations, devices, lookups, auth, collectors, observations, knowledge_graph, policies, findings, resources, resource_explorer, events, incidents, intelligence, automation, projections, query, screen, ws_live
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])
api_router.include_router(sites.router, prefix="/organizations/{org_id}/sites", tags=["Sites"])
api_router.include_router(sites.router, prefix="/sites", tags=["Sites"]) # For endpoints that don't need org_id in path (like GET by ID, PATCH, DELETE)
api_router.include_router(invitations.router, tags=["Invitations"])
api_router.include_router(devices.router, prefix="/devices", tags=["Devices"])
api_router.include_router(lookups.router, tags=["Lookups"])
api_router.include_router(collectors.router, prefix="/collectors", tags=["Collectors"])
api_router.include_router(observations.router, prefix="/observations", tags=["Observations"])
api_router.include_router(knowledge_graph.router, prefix="/knowledge-graph", tags=["Knowledge Graph"])
api_router.include_router(policies.router, prefix="/policies", tags=["Policies"])
api_router.include_router(findings.router, prefix="/findings", tags=["Findings"])
api_router.include_router(resources.router, prefix="/resources", tags=["Resources"])
api_router.include_router(events.router, prefix="/events", tags=["Events"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["Incidents"])
api_router.include_router(intelligence.router, prefix="/intelligence", tags=["Intelligence"])
api_router.include_router(automation.router, prefix="/automation", tags=["Automation"])
api_router.include_router(projections.router, prefix="/projections", tags=["Projections"])
api_router.include_router(query.router, prefix="/query", tags=["Query"])
api_router.include_router(screen.router, prefix="/screen", tags=["Screen"])
api_router.include_router(ws_live.router, prefix="/ws", tags=["Live"])
