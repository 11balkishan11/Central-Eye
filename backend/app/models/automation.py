import uuid
from sqlalchemy import Column, String, JSON, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base_class import Base

class AutomationPlan(Base):
    __tablename__ = "automation_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # DAG of steps definition
    # e.g., [{"id": "step1", "action": "restart_port", "depends_on": []}, {"id": "step2", ...}]
    steps = Column(JSONB, nullable=False)
    
    risk_level = Column(String, nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    estimated_duration_ms = Column(Integer)
    affected_resources = Column(JSONB)
    rollback_plan = Column(JSONB)
    verification_plan = Column(JSONB)
    knowledge_snapshot_id = Column(String)

    executions = relationship("AutomationExecution", back_populates="plan")


class AutomationExecution(Base):
    __tablename__ = "automation_executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("automation_plans.id"), nullable=False)
    
    status = Column(String, nullable=False, default="WAITING_FOR_APPROVAL")
    # WAITING_FOR_APPROVAL, APPROVED, REJECTED, EXPIRED, CANCELLED, RUNNING, COMPLETED, FAILED, ROLLED_BACK
    
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    initiator = Column(String) # User or system who approved/triggered it
    
    plan = relationship("AutomationPlan", back_populates="executions")
    step_results = relationship("ExecutionStepResult", back_populates="execution")


class ExecutionStepResult(Base):
    __tablename__ = "execution_step_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    execution_id = Column(UUID(as_uuid=True), ForeignKey("automation_executions.id"), nullable=False)
    
    step_id = Column(String, nullable=False) # Matches the ID in the plan DAG
    action_id = Column(String, nullable=False) # e.g. "MockSSH"
    
    status = Column(String, nullable=False, default="PENDING")
    # PENDING, RUNNING, SUCCESS, FAILED, RETRYING, ROLLED_BACK
    
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    output = Column(JSONB)
    error_message = Column(String)
    retry_count = Column(Integer, default=0)
    
    execution = relationship("AutomationExecution", back_populates="step_results")
