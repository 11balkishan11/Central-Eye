from app.models.observation import Observation

class Normalizer:
    """
    Standardizes observation payloads before they reach the change detector.
    Ensures standard formats (e.g. lowercase MAC addresses, standard timezone strings).
    """
    
    def normalize(self, observation: Observation) -> Observation:
        payload = observation.payload
        normalized_payload = {}
        
        for key, value in payload.items():
            if "mac" in key.lower() and isinstance(value, str):
                normalized_payload[key] = self._normalize_mac(value)
            elif "hostname" in key.lower() and isinstance(value, str):
                normalized_payload[key] = value.lower()
            else:
                normalized_payload[key] = value
                
        observation.payload = normalized_payload
        return observation

    def _normalize_mac(self, mac: str) -> str:
        # Simple normalization: remove separators and lowercase
        import re
        return re.sub(r'[:-]', '', mac).lower()
