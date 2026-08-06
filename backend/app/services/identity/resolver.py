from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from app.services.identity.extractor import IdentityCandidate
from app.models.digital_twin import FactVersion

class IdentityResolver:
    """
    Takes identity candidates and attempts to match them to a canonical Resource in the Digital Twin.
    """
    def __init__(self, db: Session):
        self.db = db
        
    def resolve(self, tenant_id: str, candidates: List[IdentityCandidate]) -> Optional[str]:
        """
        Returns the resource_id if a match is found, else None.
        Uses a weighted scoring system across candidates.
        """
        if not candidates:
            return None
            
        resource_scores: Dict[str, int] = {}
        
        # 1. Search Twin for each candidate
        for candidate in candidates:
            # Look for active facts where the key matches the identity type and value matches
            # e.g., fact_group_id == 'mac_address' AND payload['mac_address'] == candidate.value
            
            # MVP: Simplistic query. In a real system, we'd use a dedicated Identity Index
            # for O(1) lookups instead of scanning FactVersion JSON payloads.
            matching_facts = self.db.query(FactVersion).filter(
                FactVersion.tenant_id == tenant_id,
                FactVersion.valid_to == None,
                # Simple mapping: identity_type lowercased is usually the fact_group_id
                FactVersion.fact_group_id == candidate.identity_type.lower()
            ).all()
            
            for fact in matching_facts:
                key = candidate.identity_type.lower()
                # If there's a payload match, accumulate score
                if key in fact.payload and fact.payload[key] == candidate.value:
                    res_id = fact.resource_id
                    resource_scores[res_id] = resource_scores.get(res_id, 0) + candidate.evidence_score
                    
        # 2. Determine winner
        if not resource_scores:
            return None
            
        # Sort by score descending
        sorted_resources = sorted(resource_scores.items(), key=lambda x: x[1], reverse=True)
        winner_id, winning_score = sorted_resources[0]
        
        # We could implement a threshold here (e.g., must score > 50 to match)
        if winning_score >= 40: # e.g. at least an IP match
            return winner_id
            
        return None
