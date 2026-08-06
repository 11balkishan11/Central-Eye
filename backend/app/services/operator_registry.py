from typing import Any, Dict, List, Optional
from pydantic import BaseModel

class OperatorMetadata(BaseModel):
    id: str
    display_name: str
    description: str
    supported_types: List[str]
    arguments: str
    examples: List[str]
    deterministic: bool = True
    version: str = "1.0"

class OperatorRegistry:
    
    _operators: Dict[str, OperatorMetadata] = {
        "equals": OperatorMetadata(
            id="equals",
            display_name="Equals",
            description="Checks if the actual value exactly matches the expected value.",
            supported_types=["string", "number", "boolean"],
            arguments="1",
            examples=["vendor = 'Cisco'"]
        ),
        "less_than": OperatorMetadata(
            id="less_than",
            display_name="Less Than",
            description="Checks if the actual value is numerically less than the expected value.",
            supported_types=["number"],
            arguments="1",
            examples=["cpu < 70"]
        ),
        "greater_than": OperatorMetadata(
            id="greater_than",
            display_name="Greater Than",
            description="Checks if the actual value is numerically greater than the expected value.",
            supported_types=["number"],
            arguments="1",
            examples=["memory > 1024"]
        ),
        "exists": OperatorMetadata(
            id="exists",
            display_name="Exists",
            description="Checks if the attribute exists (is not null).",
            supported_types=["any"],
            arguments="1 (boolean)",
            examples=["bgp_process exists"]
        )
    }

    @classmethod
    def get_operator(cls, operator_id: str) -> Optional[OperatorMetadata]:
        return cls._operators.get(operator_id)
        
    @classmethod
    def list_operators(cls) -> List[OperatorMetadata]:
        return list(cls._operators.values())

    @classmethod
    def evaluate(cls, operator: str, actual_value: Any, expected_value: Any) -> bool:
        if operator == "equals":
            return actual_value == expected_value
        elif operator == "less_than":
            try:
                return float(actual_value) < float(expected_value)
            except (ValueError, TypeError):
                return False
        elif operator == "greater_than":
            try:
                return float(actual_value) > float(expected_value)
            except (ValueError, TypeError):
                return False
        elif operator == "exists":
            should_exist = expected_value if isinstance(expected_value, bool) else True
            does_exist = actual_value is not None
            return does_exist == should_exist
        
        return False

def get_operator(operator_id: str) -> Optional[OperatorMetadata]:
    return OperatorRegistry.get_operator(operator_id)
