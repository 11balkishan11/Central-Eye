from sqlalchemy import Column, String, JSON, Integer, DateTime
from datetime import datetime, timezone
from app.models.base import Base

class InventoryProjectionModel(Base):
    """
    Flat read model for the inventory list view.
    """
    __tablename__ = "inventory_projections"
    
    resource_id = Column(String, primary_key=True)
    tenant_id = Column(String, index=True, nullable=False)
    
    # Denormalized fields optimized for table sorting/filtering
    hostname = Column(String, index=True, nullable=True)
    ip_address = Column(String, index=True, nullable=True)
    mac_address = Column(String, index=True, nullable=True)
    vendor = Column(String, index=True, nullable=True)
    model = Column(String, index=True, nullable=True)
    state = Column(String, index=True, nullable=False, default="UNKNOWN")
    
    # Capabilities array for quick filtering
    capabilities = Column(JSON, nullable=True)
    
    # Projection Metadata (Idempotency and Debugging)
    last_event_version = Column(Integer, default=0)
    last_updated = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class TopologyProjectionModel(Base):
    """
    Graph read model for the topology view.
    Stores pre-computed graph structures so the UI doesn't have to join Relationships.
    """
    __tablename__ = "topology_projections"
    
    # We might have multiple topologies (e.g. L2, L3, overlay)
    topology_id = Column(String, primary_key=True)
    tenant_id = Column(String, index=True, nullable=False)
    
    # Pre-computed graph
    nodes = Column(JSON, nullable=False, default=list) # Array of node objects
    links = Column(JSON, nullable=False, default=list) # Array of link objects
    
    last_event_version = Column(Integer, default=0)
    last_updated = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
