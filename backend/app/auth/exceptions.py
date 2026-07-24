class SessionException(Exception):
    """Base exception for session related errors"""
    pass

class InvalidRefreshTokenError(SessionException):
    """Raised when the refresh token is malformed, has invalid signature, or invalid claims"""
    pass

class SessionExpiredError(SessionException):
    """Raised when trying to use an expired session"""
    pass

class SessionRevokedError(SessionException):
    """Raised when trying to use a revoked session"""
    pass

class SessionCompromisedError(SessionException):
    """Raised when trying to use a session whose family is compromised"""
    pass

class SessionNotFoundError(SessionException):
    """Raised when the session is not found in the database"""
    pass

class RefreshReuseDetectedError(SessionException):
    """Raised when token reuse is detected, indicating a compromised session family"""
    pass
