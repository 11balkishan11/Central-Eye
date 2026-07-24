from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Central Eye API"
    DATABASE_URL: str = "sqlite+aiosqlite:///app.db"
    DEBUG: bool = True
    MOCK_API_DELAY_MS: int = 500
    
    # Auth and JWT Settings
    JWT_SECRET_KEY: str = "super_secret_key_change_me_in_production_1234567890" # TODO: Load from env
    JWT_ALGORITHM: str = "HS256"
    JWT_ISSUER: str = "ns3-central"
    JWT_ACCESS_AUDIENCE: str = "ns3-central-api"
    JWT_REFRESH_AUDIENCE: str = "ns3-central-auth"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14
    
    # Security Settings
    REFRESH_TOKEN_HASH_PEPPER: str = "secret_pepper_change_me" # TODO: Load from env
    
    # Cookie Settings
    COOKIE_NAME: str = "ns3_refresh"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    COOKIE_PATH: str = "/api/v1/auth"
    COOKIE_DOMAIN: Optional[str] = None
    
    # Password & Login
    PASSWORD_MIN_LENGTH: int = 12
    LOGIN_MAX_ATTEMPTS: int = 5
    LOGIN_LOCKOUT_MINUTES: int = 15
    
    # CORS
    CORS_ALLOWED_ORIGINS: List[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
