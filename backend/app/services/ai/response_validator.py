from typing import Type
from pydantic import BaseModel, ValidationError

class ResponseValidator:
    """
    Validates that LLM JSON output matches strict Pydantic schemas.
    """
    def validate(self, raw_json: str, schema_class: Type[BaseModel]) -> BaseModel:
        try:
            return schema_class.model_validate_json(raw_json)
        except ValidationError as e:
            # Here we might trigger a retry in the ReasoningPipeline
            raise ValueError(f"LLM output failed validation: {e}")
