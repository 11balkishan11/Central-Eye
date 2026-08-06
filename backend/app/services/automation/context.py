from typing import Dict, Any, Optional
import uuid
from pydantic import Field
from app.services.knowledge.models import InfrastructureKnowledge
from app.runtime.context import RuntimeContext

class ExecutionContext(RuntimeContext):
    """
    Passed to every execution provider. Contains all required information safely.
    Inherits correlation_id and other standard fields from RuntimeContext.
    """
    execution_id: uuid.UUID
    plan_id: uuid.UUID
    knowledge_snapshot: InfrastructureKnowledge
    variables: Dict[str, Any] = Field(default_factory=dict)
    dry_run: bool = False
    timeout_ms: int = 30000
