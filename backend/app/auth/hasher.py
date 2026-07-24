import hmac
import hashlib
from app.core.config import settings

class RefreshTokenHasher:
    @staticmethod
    def hash(token: str) -> str:
        """Hash a refresh token using HMAC-SHA-256 with a pepper."""
        pepper = settings.REFRESH_TOKEN_HASH_PEPPER.encode('utf-8')
        return hmac.new(pepper, token.encode('utf-8'), hashlib.sha256).hexdigest()

    @staticmethod
    def verify(token: str, stored_hash: str) -> bool:
        """Verify a refresh token matches its HMAC hash in constant time."""
        expected_hash = RefreshTokenHasher.hash(token)
        return hmac.compare_digest(expected_hash, stored_hash)
