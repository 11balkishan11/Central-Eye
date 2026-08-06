import uuid
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session


from app.db.session import get_db
from app.services.knowledge.knowledge_service import KnowledgeService
from app.services.knowledge.models import KnowledgeQueryProfile
from app.services.ai.registry import AIRegistry
from app.services.ai.provider import MockAIProvider
from app.services.ai.prompt_renderer import PromptRenderer
from app.services.ai.reasoning_pipeline import ReasoningPipeline
from app.services.ai.schemas import AIResponse

# Load agents into registry
import app.services.ai.agents.executive_summary_agent
import app.services.ai.agents.root_cause_agent

router = APIRouter()

@router.post("/incident/{incident_id}/summarize", response_model=AIResponse)
def summarize_incident(
    incident_id: uuid.UUID,
    db: Session = Depends(get_db)
) -> Any:
    # 1. Build immutable knowledge DTO
    knowledge_service = KnowledgeService(db)
    knowledge = knowledge_service.build(incident_id, "Incident", KnowledgeQueryProfile.EXEC_SUMMARY)
    
    # 2. Get capability agent
    agent = AIRegistry.get_agent("executive_summary")
    
    # 3. Setup reasoning pipeline
    # In production, provider selection might come from configuration
    provider = MockAIProvider()
    renderer = PromptRenderer()
    pipeline = ReasoningPipeline(provider, renderer)
    
    # 4. Execute
    # The agent acts purely on the immutable DTO, completely unaware of SQLAlchemy or the HTTP Request
    return agent.execute(knowledge, pipeline)

@router.post("/incident/{incident_id}/root-cause", response_model=AIResponse)
def root_cause_incident(
    incident_id: uuid.UUID,
    db: Session = Depends(get_db)
) -> Any:
    knowledge_service = KnowledgeService(db)
    knowledge = knowledge_service.build(incident_id, "Incident", KnowledgeQueryProfile.ROOT_CAUSE)
    
    agent = AIRegistry.get_agent("root_cause")
    provider = MockAIProvider()
    renderer = PromptRenderer()
    pipeline = ReasoningPipeline(provider, renderer)
    
    return agent.execute(knowledge, pipeline)
