from typing import Dict, Any, Type, Optional
from app.services.ai.schemas import AIRequest, AIResponse

class AIRegistry:
    """
    Registry for AI capabilities. 
    UI/API requests capabilities by string ("root_cause"), not by agent class.
    """
    _agents: Dict[str, Any] = {}
    
    @classmethod
    def register(cls, capability: str):
        def decorator(agent_class):
            cls._agents[capability] = agent_class
            return agent_class
        return decorator
        
    @classmethod
    def get_agent(cls, capability: str) -> Any:
        agent_class = cls._agents.get(capability)
        if not agent_class:
            raise ValueError(f"No agent registered for capability: {capability}")
        return agent_class()
