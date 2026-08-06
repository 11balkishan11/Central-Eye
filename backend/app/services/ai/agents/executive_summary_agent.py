from typing import Any
import uuid

from app.services.ai.registry import AIRegistry
from app.services.ai.schemas import AIRequest, AIResponse
from app.services.ai.reasoning_pipeline import ReasoningPipeline
from app.services.knowledge.models import InfrastructureKnowledge

@AIRegistry.register("executive_summary")
class ExecutiveSummaryAgent:
    """
    Produces high-level summaries for business leaders.
    """
    def execute(self, knowledge: InfrastructureKnowledge, pipeline: ReasoningPipeline) -> AIResponse:
        request = AIRequest(
            purpose="executive_summary",
            knowledge=knowledge,
            instructions="Summarize this incident for a non-technical executive. Highlight business impact based on the blast radius.",
            temperature=0.2,
            citations_required=True
        )
        return pipeline.execute(request)
