from typing import Dict, Any, List, Optional, Union
from datetime import datetime
import uuid
from pydantic import BaseModel, Field, validator

class RuleSchema(BaseModel):
    id: str
    attribute: str
    operator: str
    value: Any

class RuleGroupSchema(BaseModel):
    rules: List[RuleSchema]

class PolicyVersionBase(BaseModel):
    version: int
    match_criteria: Dict[str, Any] = Field(default_factory=dict)
    rule_schema: RuleGroupSchema

class PolicyVersionCreate(BaseModel):
    engine: str = Field(..., description="The engine that should evaluate this policy version (e.g., 'configuration', 'security')")
    match_criteria: Dict[str, Any] = Field(default_factory=dict)
    rule_schema: RuleGroupSchema

    @validator('rule_schema')
    def validate_operators(cls, v):
        from app.services.operator_registry import get_operator
        for rule in v.rules:
            if not get_operator(rule.operator):
                raise ValueError(f"Unknown operator: {rule.operator}")
        return v

class PolicyVersionResponse(PolicyVersionBase):
    id: uuid.UUID
    policy_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

class PolicyTestRequest(BaseModel):
    resource_id: Optional[uuid.UUID] = None
    facts: Optional[Dict[str, Any]] = None

class PolicyBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class PolicyCreate(PolicyBase):
    tenant_id: uuid.UUID
    version: PolicyVersionCreate

class PolicyResponse(PolicyBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime
    versions: List[PolicyVersionResponse] = []

    class Config:
        from_attributes = True
