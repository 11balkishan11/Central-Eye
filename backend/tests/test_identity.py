from app.services.identity.extractor import IdentityExtractor
from app.services.identity.fingerprint import ResourceFingerprintEngine

def test_identity_extraction():
    extractor = IdentityExtractor()
    payload = {
        "mac_address": "AA:BB:CC:DD:EE:FF",
        "ip_address": "10.0.0.5",
        "hostname": "sw01"
    }
    
    candidates = extractor.extract(payload)
    assert len(candidates) == 3
    
    mac_candidate = next(c for c in candidates if c.identity_type == "MAC")
    assert mac_candidate.value == "AA:BB:CC:DD:EE:FF"
    assert mac_candidate.evidence_score == 90
    
    ip_candidate = next(c for c in candidates if c.identity_type == "IP")
    assert ip_candidate.value == "10.0.0.5"
    assert ip_candidate.evidence_score == 40

def test_resource_fingerprint():
    engine = ResourceFingerprintEngine()
    payload = {
        "sys_description": "Cisco IOS Software, Catalyst 3850 Switch"
    }
    
    inferred = engine.fingerprint(payload)
    assert inferred["vendor"] == "Cisco"
    assert inferred["model"] == "Catalyst 3850"
    assert "SupportsSSH" in inferred["capabilities"]
    assert "Switch" in inferred["capabilities"]
