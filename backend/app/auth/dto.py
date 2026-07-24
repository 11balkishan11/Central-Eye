import dataclasses
from app.models.user import User, UserSession

@dataclasses.dataclass
class AuthResult:
    """
    Data Transfer Object returned by AuthService.
    Encapsulates the resulting tokens, user, and session.
    """
    user: User
    session: UserSession
    access_token: str
    refresh_token: str
