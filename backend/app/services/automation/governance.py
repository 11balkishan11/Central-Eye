import uuid
from typing import Dict, Any
from app.models.automation import AutomationPlan

class PolicyGuard:
    """
    Validates plans against business rules before approval is even considered.
    """
    def validate(self, plan: AutomationPlan) -> bool:
        # Check against blackout windows, frozen resources, etc.
        # MVP: always valid
        return True

class ApprovalEngine:
    """
    Authorizes validated plans based on risk.
    """
    def evaluate(self, plan: AutomationPlan) -> str:
        """
        Returns the required status: AUTO_APPROVED, WAITING_FOR_APPROVAL, REJECTED
        """
        if plan.risk_level == "LOW":
            return "AUTO_APPROVED"
        elif plan.risk_level in ("MEDIUM", "HIGH"):
            return "WAITING_FOR_APPROVAL"
        else: # CRITICAL
            # Maybe critical requires manual intervention, or is just rejected outright for automation
            return "REJECTED"
