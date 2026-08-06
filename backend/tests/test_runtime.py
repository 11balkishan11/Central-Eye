from datetime import datetime, timezone
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import Column, String
from sqlalchemy.ext.declarative import declarative_base

from app.runtime.clock import Clock
from app.runtime.tenant.repository import TenantRepository
from app.runtime.locking.lock import PostgresAdvisoryLock

def test_clock_mocking():
    # Setup
    now = datetime.now(timezone.utc)
    mock_time = datetime(2025, 1, 1, tzinfo=timezone.utc)
    
    # Assert actual time
    assert Clock.now() >= now
    
    # Mock it
    Clock.set_mock_time(mock_time)
    assert Clock.now() == mock_time
    
    # Reset
    Clock.reset()
    assert Clock.now() >= now

Base = declarative_base()
class MockTenantModel(Base):
    __tablename__ = "mock_tenant_model"
    id = Column(String, primary_key=True)
    tenant_id = Column(String, nullable=False)
    name = Column(String)

def test_tenant_repository_isolation(db_session: Session):
    # Need to create table in the test DB schema temporarily
    Base.metadata.create_all(db_session.get_bind())
    
    try:
        # Create repos for two tenants
        repo_a = TenantRepository(db_session, MockTenantModel, "tenant_a")
        repo_b = TenantRepository(db_session, MockTenantModel, "tenant_b")
        
        # Create models
        model_a = repo_a.create({"id": str(uuid.uuid4()), "name": "Item A"})
        model_b = repo_b.create({"id": str(uuid.uuid4()), "name": "Item B"})
        
        # Assert isolation
        assert len(repo_a.get_all()) == 1
        assert repo_a.get_all()[0].name == "Item A"
        assert repo_a.get_all()[0].tenant_id == "tenant_a"
        
        assert len(repo_b.get_all()) == 1
        assert repo_b.get_all()[0].name == "Item B"
        assert repo_b.get_all()[0].tenant_id == "tenant_b"
        
        # Assert cross-tenant reads return None
        assert repo_a.get(model_b.id) is None
        assert repo_b.get(model_a.id) is None
    finally:
        Base.metadata.drop_all(db_session.get_bind())

def test_postgres_advisory_lock(db_session: Session):
    lock_service = PostgresAdvisoryLock(db_session)
    
    # Should successfully acquire
    with lock_service.acquire("test_resource_1"):
        # We are holding the lock
        pass
        
    # Should successfully acquire again (previous transaction ended / yielded)
    with lock_service.acquire("test_resource_1"):
        pass
