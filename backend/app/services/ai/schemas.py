from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.services.knowledge.models import InfrastructureKnowledge

class Citation(BaseModel):
    type: str = Field(description="e.g., 'Event', 'Finding', 'Incident', 'Resource'")
    id: str = Field(description="The UUID of the referenced entity")
    title: str = Field(description="A human readable title for the citation")
    excerpt: Optional[str] = Field(None, description="The specific excerpt or context")
    confidence: float = Field(1.0, description="Confidence in this citation")

class AIRequest(BaseModel):
    purpose: str = Field(description="The capability/intent (e.g., 'root_cause')")
    knowledge: InfrastructureKnowledge = Field(description="The immutable DTO")
    instructions: Optional[str] = None
    temperature: float = 0.0
    citations_required: bool = True
    model_preferences: Optional[Dict[str, Any]] = None
    timeout: int = 30

class AIResponse(BaseModel):
    content: str
    citations: List[Citation] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    confidence: float
    usage: Dict[str, int] = Field(default_factory=dict)
    latency_ms: int
    provider: str
    model: str
    prompt_version: str
