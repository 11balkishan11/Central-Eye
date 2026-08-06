from typing import Any, Dict
import os

class ConfigurationService:
    """
    Provides typed runtime configuration values.
    Replaces hardcoded magic constants throughout domain code.
    """
    _overrides: Dict[str, Any] = {}

    @classmethod
    def get(cls, key: str, default: Any = None) -> Any:
        if key in cls._overrides:
            return cls._overrides[key]
            
        # MVP: simple dictionary of defaults, falling back to os.environ if needed
        defaults = {
            "automation.max_retry": 3,
            "automation.timeout_ms": 30000,
            "graph.depth": 3,
            "incident.window_seconds": 3600,
            "ai.timeout_seconds": 45,
            "ai.default_temperature": 0.1,
            "cache.ttl_seconds": 300
        }
        
        val = defaults.get(key, default)
        
        # Check env var format (e.g. "automation.max_retry" -> "AUTOMATION_MAX_RETRY")
        env_key = key.replace(".", "_").upper()
        if env_key in os.environ:
            return os.environ[env_key]
            
        return val

    @classmethod
    def set_override(cls, key: str, value: Any):
        """For testing or dynamic runtime overrides"""
        cls._overrides[key] = value
        
    @classmethod
    def clear_overrides(cls):
        cls._overrides.clear()
