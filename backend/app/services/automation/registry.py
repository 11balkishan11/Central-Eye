from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.services.automation.context import ExecutionContext

class AutomationAction(ABC):
    @property
    @abstractmethod
    def id(self) -> str:
        pass
        
    @property
    @abstractmethod
    def display_name(self) -> str:
        pass
        
    @property
    @abstractmethod
    def risk_level(self) -> str:
        pass
        
    @property
    @abstractmethod
    def supports_dry_run(self) -> bool:
        pass
        
    @property
    @abstractmethod
    def is_idempotent(self) -> bool:
        pass
        
    @abstractmethod
    def validate(self, context: ExecutionContext, step_params: Dict[str, Any]) -> bool:
        pass
        
    @abstractmethod
    def execute(self, context: ExecutionContext, step_params: Dict[str, Any]) -> Dict[str, Any]:
        pass
        
    @abstractmethod
    def rollback(self, context: ExecutionContext, step_params: Dict[str, Any], previous_output: Dict[str, Any]) -> bool:
        pass

class AutomationRegistry:
    _actions: Dict[str, AutomationAction] = {}
    
    @classmethod
    def register(cls, action_instance: AutomationAction):
        cls._actions[action_instance.id] = action_instance
        
    @classmethod
    def get_action(cls, action_id: str) -> AutomationAction:
        action = cls._actions.get(action_id)
        if not action:
            raise ValueError(f"No action registered with ID: {action_id}")
        return action
        
    @classmethod
    def list_actions(cls) -> List[Dict[str, Any]]:
        return [
            {
                "id": a.id,
                "display_name": a.display_name,
                "risk_level": a.risk_level,
                "supports_dry_run": a.supports_dry_run,
                "is_idempotent": a.is_idempotent
            } for a in cls._actions.values()
        ]
