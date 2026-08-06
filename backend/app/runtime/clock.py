from datetime import datetime, timezone

class Clock:
    """
    Universal clock abstraction for the platform.
    Never use datetime.now() directly in domain logic to ensure testability.
    """
    _mock_time = None
    
    @classmethod
    def now(cls) -> datetime:
        if cls._mock_time:
            return cls._mock_time
        return datetime.now(timezone.utc)
        
    @classmethod
    def set_mock_time(cls, mock_time: datetime):
        cls._mock_time = mock_time
        
    @classmethod
    def reset(cls):
        cls._mock_time = None
