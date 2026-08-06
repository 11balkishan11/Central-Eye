from typing import Any
from app.services.ai.schemas import AIRequest, AIResponse
from app.services.ai.provider import AIProvider

class ReasoningPipeline:
    """
    Handles the execution loop for AI Agents.
    Agent Intent -> Prompt Renderer -> Provider -> Parser
    """
    def __init__(self, provider: AIProvider, prompt_renderer: Any):
        self.provider = provider
        self.prompt_renderer = prompt_renderer
        
    def execute(self, request: AIRequest) -> AIResponse:
        # 1. Render prompt
        system_prompt = self.prompt_renderer.render_system_prompt(request.purpose)
        rendered_prompt = self.prompt_renderer.render(request)
        
        # 2. Execute via provider
        # Note: the provider should theoretically use response_validator.py
        # to ensure the LLM output matches the Pydantic schema before returning
        response = self.provider.execute(request, rendered_prompt, system_prompt)
        
        return response
