from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

from app.models.policy import PolicyVersion
from app.models.resource import Resource, Fact

class EvaluationContext(BaseModel):
    trigger: str = Field(description="OBSERVATION, MANUAL, SCHEDULED, API, TEST_RUNNER")
    timestamp: datetime
    synthetic_facts: Optional[Dict[str, Any]] = None
    
    # Graph Intelligence context
    neighbors: List[Resource] = Field(default_factory=list)
    upstream: List[Resource] = Field(default_factory=list)
    downstream: List[Resource] = Field(default_factory=list)
    dependency_tree: Dict[str, Any] = Field(default_factory=dict)
    graph_snapshot: Dict[str, Any] = Field(default_factory=dict)
    recent_history: List[Dict[str, Any]] = Field(default_factory=list)
    active_findings: List[Dict[str, Any]] = Field(default_factory=list)
    policies: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(arbitrary_types_allowed=True)

class EvaluationRequest(BaseModel):
    resource: Optional[Resource]
    facts: List[Fact] = Field(default_factory=list)
    policy_version: PolicyVersion
    context: EvaluationContext

    model_config = ConfigDict(arbitrary_types_allowed=True)

class EvaluationResult(BaseModel):
    status: str = Field(description="PASS, FAIL, UNKNOWN, NOT_APPLICABLE, SKIPPED, ERROR")
    trace: Dict[str, Any]
    metrics: Dict[str, Any] = Field(default_factory=dict)
    evidence_facts: List[Fact] = Field(default_factory=list)
    
    class Config:
        arbitrary_types_allowed = True

class BaseEngine(ABC):
    engine_name: str
    engine_version: str
    
    @abstractmethod
    def evaluate(self, request: EvaluationRequest) -> EvaluationResult:
        """Evaluate a single resource against a specific policy version based on the request."""
        pass
