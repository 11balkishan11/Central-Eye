from typing import Dict, List, Optional
from pydantic import BaseModel

from app.services.engines.base_engine import BaseEngine

class EngineMetadata(BaseModel):
    id: str
    display_name: str
    description: str
    version: str
    supported_operators: List[str]
    supported_resources: List[str]
    documentation: str
    examples: List[str]

class EngineRegistry:
    _engines: Dict[str, BaseEngine] = {}
    _metadata: Dict[str, EngineMetadata] = {}

    @classmethod
    def register(cls, engine: BaseEngine, metadata: EngineMetadata):
        cls._engines[metadata.id] = engine
        cls._metadata[metadata.id] = metadata

    @classmethod
    def get_engine(cls, engine_id: str) -> Optional[BaseEngine]:
        return cls._engines.get(engine_id)

    @classmethod
    def get_metadata(cls, engine_id: str) -> Optional[EngineMetadata]:
        return cls._metadata.get(engine_id)

    @classmethod
    def list_metadata(cls) -> List[EngineMetadata]:
        return list(cls._metadata.values())
