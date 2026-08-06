from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from app.core.middleware import RequestIdMiddleware
from app.api.exceptions import setup_exception_handlers
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.api import api_router
from app.tasks.collector_cleanup import collector_cleanup_task, registration_key_cleanup_task
from app.services.scheduler_service import scheduler

from app.services.events.bus import InMemoryDomainEventBus
from app.services.projections.registry import ProjectionRegistry
from app.services.projections.engine import ProjectionEngine
from app.services.projections.builders.inventory import InventoryProjectionBuilder
from app.services.projections.builders.topology import TopologyProjectionBuilder
from app.database import SessionLocal

# Global instances for MVP
domain_event_bus = InMemoryDomainEventBus()
projection_registry = ProjectionRegistry()
projection_registry.register(InventoryProjectionBuilder())
projection_registry.register(TopologyProjectionBuilder())
projection_engine = ProjectionEngine(
    event_bus=domain_event_bus, 
    registry=projection_registry,
    db=SessionLocal()
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background tasks
    task1 = asyncio.create_task(collector_cleanup_task())
    task2 = asyncio.create_task(registration_key_cleanup_task())
    await scheduler.start()
    
    # Start Projection Engine
    projection_engine.start()
    
    yield
    # Cleanup tasks
    task1.cancel()
    task2.cancel()
    await scheduler.stop()

app = FastAPI(title="Central Eye API", version="1.0.0", lifespan=lifespan)

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
