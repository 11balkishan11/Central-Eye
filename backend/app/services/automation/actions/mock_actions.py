import time
from typing import Dict, Any
from app.services.automation.registry import AutomationAction
from app.services.automation.context import ExecutionContext

class MockRESTAction(AutomationAction):
    @property
    def id(self) -> str: return "mock_rest"
    
    @property
    def display_name(self) -> str: return "Mock REST Call"
    
    @property
    def risk_level(self) -> str: return "LOW"
    
    @property
    def supports_dry_run(self) -> bool: return True
    
    @property
    def is_idempotent(self) -> bool: return True
    
    def validate(self, context: ExecutionContext, step_params: Dict[str, Any]) -> bool:
        if "endpoint" not in step_params:
            raise ValueError("Missing endpoint parameter")
        return True
        
    def execute(self, context: ExecutionContext, step_params: Dict[str, Any]) -> Dict[str, Any]:
        if context.dry_run:
            return {"status": "dry_run_success"}
        time.sleep(0.5)
        return {"status": "success", "status_code": 200, "response": {"mocked": True}}
        
    def rollback(self, context: ExecutionContext, step_params: Dict[str, Any], previous_output: Dict[str, Any]) -> bool:
        return True


class MockSSHAction(AutomationAction):
    @property
    def id(self) -> str: return "mock_ssh"
    
    @property
    def display_name(self) -> str: return "Mock SSH Command"
    
    @property
    def risk_level(self) -> str: return "MEDIUM"
    
    @property
    def supports_dry_run(self) -> bool: return True
    
    @property
    def is_idempotent(self) -> bool: return False
    
    def validate(self, context: ExecutionContext, step_params: Dict[str, Any]) -> bool:
        if "command" not in step_params:
            raise ValueError("Missing command parameter")
        return True
        
    def execute(self, context: ExecutionContext, step_params: Dict[str, Any]) -> Dict[str, Any]:
        if context.dry_run:
            return {"status": "dry_run_success"}
        time.sleep(1.0)
        return {"status": "success", "stdout": "Mocked command output"}
        
    def rollback(self, context: ExecutionContext, step_params: Dict[str, Any], previous_output: Dict[str, Any]) -> bool:
        # In a real SSH action, rollback might execute the inverse command provided in step_params
        return True


class FailureAction(AutomationAction):
    @property
    def id(self) -> str: return "failure_action"
    
    @property
    def display_name(self) -> str: return "Always Fails (Testing)"
    
    @property
    def risk_level(self) -> str: return "LOW"
    
    @property
    def supports_dry_run(self) -> bool: return True
    
    @property
    def is_idempotent(self) -> bool: return True
    
    def validate(self, context: ExecutionContext, step_params: Dict[str, Any]) -> bool:
        return True
        
    def execute(self, context: ExecutionContext, step_params: Dict[str, Any]) -> Dict[str, Any]:
        if context.dry_run:
            return {"status": "dry_run_success"}
        raise RuntimeError("Intentional failure for testing")
        
    def rollback(self, context: ExecutionContext, step_params: Dict[str, Any], previous_output: Dict[str, Any]) -> bool:
        return True
