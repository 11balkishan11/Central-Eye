from abc import ABC, abstractmethod
from sqlalchemy.orm import Session
from sqlalchemy import text
import contextlib

class LockService(ABC):
    @abstractmethod
    @contextlib.contextmanager
    def acquire(self, resource_id: str, timeout_seconds: int = 30):
        pass

class PostgresAdvisoryLock(LockService):
    """
    Uses PostgreSQL advisory locks for distributed locking without needing Redis.
    Uses a standard hashing mechanism to convert resource string into a 64-bit integer.
    """
    def __init__(self, db: Session):
        self.db = db
        
    @contextlib.contextmanager
    def acquire(self, resource_id: str, timeout_seconds: int = 30):
        # Convert resource_id string to a 64-bit integer lock ID using hash()
        # In a real impl, you'd use a stable hash like hashlib or zlib.crc32
        import zlib
        lock_id = zlib.crc32(resource_id.encode('utf-8'))
        
        # Try to acquire lock
        # pg_try_advisory_xact_lock acquires a transaction-level exclusive lock that is automatically
        # released at the end of the transaction.
        try:
            result = self.db.execute(text(f"SELECT pg_try_advisory_xact_lock({lock_id})")).scalar()
            if not result:
                raise TimeoutError(f"Could not acquire lock for {resource_id}")
            yield
        finally:
            # Transaction end will release the lock
            pass
