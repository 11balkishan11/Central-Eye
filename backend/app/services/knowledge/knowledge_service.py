import uuid
from sqlalchemy.orm import Session

from app.services.knowledge.models import InfrastructureKnowledge, KnowledgeQueryProfile
from app.services.knowledge.context_assembler import ContextAssembler

class KnowledgeService:
    """
    Canonical interface for retrieving infrastructure knowledge.
    Used by UI, API, AI, and Automation.
    """
    def __init__(self, db: Session):
        self.db = db
        self.assembler = ContextAssembler(db)

    def build(self, entity_id: uuid.UUID, entity_type: str = "Incident", profile: KnowledgeQueryProfile = KnowledgeQueryProfile.FULL) -> InfrastructureKnowledge:
        """
        Builds the immutable knowledge DTO based on the requested profile.
        """
        return self.assembler.assemble(entity_id, entity_type, profile)
