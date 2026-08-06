import uuid
import pytest
from unittest.mock import MagicMock

from app.services.ai.registry import AIRegistry
from app.services.ai.provider import MockAIProvider
from app.services.ai.prompt_renderer import PromptRenderer
from app.services.ai.reasoning_pipeline import ReasoningPipeline
from app.services.knowledge.models import InfrastructureKnowledge

# Make sure agents are imported
import app.services.ai.agents.executive_summary_agent

def test_mock_pipeline_execution():
    """
    Test that the ReasoningPipeline successfully runs a registered agent via MockAIProvider
    and returns a structured AIResponse with citations.
    """
    agent = AIRegistry.get_agent("executive_summary")
    provider = MockAIProvider()
    renderer = PromptRenderer()
    pipeline = ReasoningPipeline(provider, renderer)
    
    # Create mock knowledge
    knowledge = InfrastructureKnowledge(
        incident={"id": "mocked-uuid", "status": "OPEN"}
    )
    
    response = agent.execute(knowledge, pipeline)
    
    assert response.provider == "mock"
    assert response.confidence == 0.95
    assert len(response.citations) > 0
    assert response.citations[0].type == "Incident"

def test_knowledge_is_decoupled_from_db():
    """
    Test that InfrastructureKnowledge contains no SQLAlchemy sessions or queryable objects.
    It should just be a Pydantic model.
    """
    knowledge = InfrastructureKnowledge()
    
    # Ensure it's frozen
    with pytest.raises(Exception):
        knowledge.new_field = "test"
        
    # Ensure no db session exists on it
    assert not hasattr(knowledge, "db")
    assert not hasattr(knowledge, "session")
    
def test_unregistered_agent_throws():
    """
    Test that requesting an unregistered capability throws an error.
    """
    with pytest.raises(ValueError):
        AIRegistry.get_agent("non_existent_capability")
