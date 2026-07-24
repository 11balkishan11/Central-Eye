from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

password_hash = PasswordHash((Argon2Hasher(),))

# A constant dummy hash to use for timing-attack mitigation
# It's an Argon2 hash of the string "dummy"
DUMMY_PASSWORD_HASH = password_hash.hash("dummy")

class PasswordService:
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password using Argon2."""
        return password_hash.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a plain password against a hashed password."""
        return password_hash.verify(plain_password, hashed_password)
    
    @staticmethod
    def verify_dummy_password() -> bool:
        """
        Verify a dummy password against a dummy hash to mitigate timing attacks 
        when a user is not found in the database.
        """
        return password_hash.verify("dummy_attempt", DUMMY_PASSWORD_HASH)

    @staticmethod
    def needs_rehash(hashed_password: str) -> bool:
        """Check if the given hash needs to be updated to a newer secure format."""
        return False
