
from app.services.ai.registry import AIRegistry
from app.services.ai.schemas import AIRequest, AIResponse
from app.services.ai.reasoning_pipeline import ReasoningPipeline
from app.services.knowledge.models import InfrastructureKnowledge

@AIRegistry.register("root_cause")
class RootCauseAgent:
    """
    Traces dependency failures for root cause analysis.
    """
    def execute(self, knowledge: InfrastructureKnowledge, pipeline: ReasoningPipeline) -> AIResponse:
        request = AIRequest(
            purpose="root_cause",
            knowledge=knowledge,
            instructions="Trace the dependency graph and event timeline to explain the precise root cause. Explicitly list your assumptions and cite your sources.",
            temperature=0.1,
            citations_required=True
        )
        return pipeline.execute(request)
