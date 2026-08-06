from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.models.automation import AutomationPlan, AutomationExecution

class VerificationRule(ABC):
    @abstractmethod
    def evaluate(self, execution: AutomationExecution) -> bool:
        pass

class MockPingRule(VerificationRule):
    def evaluate(self, execution: AutomationExecution) -> bool:
        # Mock logic checking if a resource is pingable
        return True

class MockPolicyPassedRule(VerificationRule):
    def evaluate(self, execution: AutomationExecution) -> bool:
        return True
        
class MockIncidentClosedRule(VerificationRule):
    def evaluate(self, execution: AutomationExecution) -> bool:
        return True

class VerificationEngine:
    """
    Executes rules after automation to ensure the intended outcome occurred.
    """
    def __init__(self):
        # MVP: Register rules statically
        self.rules = {
            "ping": MockPingRule(),
            "policy_eval": MockPolicyPassedRule(),
            "incident_closed": MockIncidentClosedRule()
        }
        
    def verify(self, execution: AutomationExecution) -> bool:
        plan = execution.plan
        if not plan.verification_plan or "rules" not in plan.verification_plan:
            return True
            
        for rule_name in plan.verification_plan["rules"]:
            rule = self.rules.get(rule_name)
            if rule and not rule.evaluate(execution):
                return False
                
        return True
