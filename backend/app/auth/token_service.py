import jwt
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple, List
import uuid

from app.core.config import settings

class TokenService:
    @staticmethod
    def create_access_token(
        subject: str,
        session_id: str,
        refresh_jti: Optional[str] = None,
        tenant_id: Optional[str] = None,
        membership_id: Optional[str] = None,
        roles: Optional[List[str]] = None
    ) -> str:
        """Create a short-lived JWT access token."""
        now = datetime.now(timezone.utc)
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        jti = str(uuid.uuid4())
        
        to_encode: Dict[str, Any] = {
            "sub": subject,
            "sid": session_id,
            "jti": jti,
            "type": "access",
            "iss": settings.JWT_ISSUER,
            "aud": settings.JWT_ACCESS_AUDIENCE,
            "iat": now,
            "nbf": now,
            "exp": expire,
        }
        
        if refresh_jti:
            to_encode["refresh_jti"] = refresh_jti
        if tenant_id:
            to_encode["tenant_id"] = tenant_id
        if membership_id:
            to_encode["membership_id"] = membership_id
        if roles is not None:
            to_encode["roles"] = roles
            
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.JWT_SECRET_KEY, 
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt

    @staticmethod
    def create_refresh_token(
        subject: str, 
        session_id: str, 
        family_id: str
    ) -> Tuple[str, str, datetime]:
        """Create a long-lived JWT refresh token. Returns (raw_token, jti, expire_datetime)."""
        now = datetime.now(timezone.utc)
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        jti = str(uuid.uuid4())
        
        to_encode: Dict[str, Any] = {
            "sub": subject,
            "sid": session_id,
            "fid": family_id,
            "jti": jti,
            "type": "refresh",
            "iss": settings.JWT_ISSUER,
            "aud": settings.JWT_REFRESH_AUDIENCE,
            "iat": now,
            "nbf": now,
            "exp": expire
        }
        
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.JWT_SECRET_KEY, 
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt, jti, expire

    @staticmethod
    def decode_token(token: str, audience: str) -> Dict[str, Any]:
        """
        Decode and validate a JWT. 
        Explicitly checks signature, exp, iss, aud, nbf.
        Raises jwt.PyJWTError (e.g. ExpiredSignatureError, InvalidTokenError) on failure.
        """
        return jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            audience=audience,
            options={
                "require": ["exp", "iss", "aud", "nbf", "sub", "jti", "type", "sid"]
            }
        )

    @staticmethod
    def create_collector_token(
        subject: str,
        token_type: str,
        audience: str,
        expires_delta: timedelta
    ) -> str:
        now = datetime.now(timezone.utc)
        expire = now + expires_delta
        jti = str(uuid.uuid4())
        
        to_encode: Dict[str, Any] = {
            "sub": subject,
            "jti": jti,
            "type": token_type,
            "iss": settings.JWT_ISSUER,
            "aud": audience,
            "iat": now,
            "nbf": now,
            "exp": expire,
        }
        
        return jwt.encode(
            to_encode, 
            settings.JWT_SECRET_KEY, 
            algorithm=settings.JWT_ALGORITHM
        )

    @staticmethod
    def decode_collector_token(token: str, audience: str) -> Dict[str, Any]:
        return jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            audience=audience,
            options={
                "require": ["exp", "iss", "aud", "nbf", "sub", "jti", "type"]
            }
        )


