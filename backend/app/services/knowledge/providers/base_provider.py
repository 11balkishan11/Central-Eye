from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import uuid
from sqlalchemy.orm import Session

class BaseKnowledgeProvider(ABC):
    def __init__(self, db: Session):
        self.db = db
        
    @abstractmethod
    def fetch(self, entity_id: uuid.UUID, entity_type: str = "Resource", **kwargs) -> Optional[Any]:
        pass
