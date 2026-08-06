from typing import List, Dict, Any
from pydantic import BaseModel

class IdentityCandidate(BaseModel):
    identity_type: str # 'MAC', 'IP', 'HOSTNAME', 'SERIAL'
    value: str
    evidence_score: int

class IdentityExtractor:
    """
    Parses raw observation payloads to extract potential identities.
    Assigns baseline evidence scores based on the type of identity.
    """
    
    # Baseline trust scores for identity types
    EVIDENCE_WEIGHTS = {
        "SERIAL": 100,
        "MAC": 90,
        "SSH_HOST_KEY": 85,
        "IP": 40,
        "HOSTNAME": 25
    }
    
    def extract(self, payload: Dict[str, Any]) -> List[IdentityCandidate]:
        candidates = []
        
        # In a real system, these keys might be nested or named differently 
        # depending on the normalized schema.
        if "serial_number" in payload:
            candidates.append(IdentityCandidate(
                identity_type="SERIAL", 
                value=payload["serial_number"],
                evidence_score=self.EVIDENCE_WEIGHTS["SERIAL"]
            ))
            
        if "mac_address" in payload:
            candidates.append(IdentityCandidate(
                identity_type="MAC",
                value=payload["mac_address"],
                evidence_score=self.EVIDENCE_WEIGHTS["MAC"]
            ))
            
        if "ip_address" in payload:
            candidates.append(IdentityCandidate(
                identity_type="IP",
                value=payload["ip_address"],
                evidence_score=self.EVIDENCE_WEIGHTS["IP"]
            ))
            
        if "hostname" in payload:
            candidates.append(IdentityCandidate(
                identity_type="HOSTNAME",
                value=payload["hostname"],
                evidence_score=self.EVIDENCE_WEIGHTS["HOSTNAME"]
            ))
            
        return candidates
