import pytest
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models.observation import Observation
from app.models.digital_twin import FactVersion
from app.services.twin.change_detector import ChangeDetector
from app.services.twin.resolvers.registry import ConflictResolverRegistry
from app.services.twin.transaction import TwinTransactionManager

def test_change_detector_drops_unchanged(db_session: Session):
    detector = ChangeDetector(db_session)
    
    # Insert a fact
    fact = FactVersion(
        tenant_id="t1",
        fact_group_id="hostname",
        resource_id="res1",
        version="1",
        payload={"hostname": "SW-01"}
    )
    db_session.add(fact)
    db_session.commit()
    
    # Observation with same payload
    obs = Observation(
        tenant_id="t1",
        collector_id="c1",
        resource_id="res1",
        payload={"hostname": "SW-01"}
    )
    
    assert detector.has_changed(obs) is False

def test_twin_transaction_manager_resolves_conflict(db_session: Session):
    registry = ConflictResolverRegistry()
    manager = TwinTransactionManager(db_session, registry)
    
    obs = Observation(
        tenant_id="t1",
        collector_id="c1",
        resource_id="res1",
        payload={"hostname": "SW-NEW"},
        evidence={"confidence": 0.9}
    )
    
    manager.reconcile_and_commit(obs)
    
    facts = db_session.query(FactVersion).filter(FactVersion.resource_id == "res1").all()
    assert len(facts) == 1
    assert facts[0].payload["hostname"] == "SW-NEW"
    assert facts[0].evidence["confidence"] == 0.9
