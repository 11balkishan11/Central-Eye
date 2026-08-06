import uuid
from typing import Dict, Any, Optional
from app.services.knowledge.providers.base_provider import BaseKnowledgeProvider
from app.models.incident import Incident

class IncidentProvider(BaseKnowledgeProvider):
    def fetch(self, entity_id: uuid.UUID, entity_type: str = "Incident", **kwargs) -> Optional[Dict[str, Any]]:
        if entity_type != "Incident":
            return None
            
        incident = self.db.query(Incident).filter(Incident.id == entity_id).first()
        if not incident:
            return None
            
        return {
            "id": str(incident.id),
            "status": incident.status,
            "severity": incident.severity,
            "priority": incident.priority,
            "root_cause_resource_id": str(incident.root_cause_resource_id) if incident.root_cause_resource_id else None,
            "created_at": incident.created_at.isoformat() if incident.created_at else None,
            "resolved_at": incident.resolved_at.isoformat() if incident.resolved_at else None,
            "affected_resources": [{"id": str(r.id), "type": r.type, "name": r.name} for r in incident.affected_resources],
            "supporting_findings": [{"id": str(f.id), "severity": f.severity, "status": f.status} for f in incident.supporting_findings]
        }
