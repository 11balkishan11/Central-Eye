from app.services.ai.schemas import AIRequest

class PromptRenderer:
    """
    Safely injects InfrastructureKnowledge DTOs into markdown prompt templates.
    """
    def render_system_prompt(self, capability: str) -> str:
        # MVP: hardcoded templates based on capability
        if capability == "root_cause":
            return "You are a Root Cause Analysis Agent. Your job is to trace failures through dependency trees."
        elif capability == "executive_summary":
            return "You are an Executive Summary Agent. Your job is to summarize incidents for business leaders."
        return "You are an AI Assistant."
        
    def render(self, request: AIRequest) -> str:
        # Serialize the DTO for the prompt
        knowledge_json = request.knowledge.model_dump_json(indent=2, exclude_none=True)
        
        prompt = f"""
# Instructions
{request.instructions or 'Provide a structured response based on the knowledge.'}

# Infrastructure Knowledge
{knowledge_json}
"""
        return prompt
