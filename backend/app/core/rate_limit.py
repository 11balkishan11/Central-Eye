from abc import ABC, abstractmethod

class RateLimiter(ABC):
    """
    Abstract interface for rate limiting.
    Allows testing/MVP with a stub or in-memory, while remaining ready for Redis in production.
    """
    @abstractmethod
    async def check(self, key: str, limit: int, window: int) -> bool:
        """
        Check if the key has exceeded the limit within the window (seconds).
        Returns True if allowed, False if rate limited.
        """
        pass

    @abstractmethod
    async def reset(self, key: str) -> None:
        """
        Reset the rate limit for a key (e.g. after successful login).
        """
        pass

class StubRateLimiter(RateLimiter):
    """No-op rate limiter for development and tests."""
    async def check(self, key: str, limit: int, window: int) -> bool:
        return True
        
    async def reset(self, key: str) -> None:
        pass
