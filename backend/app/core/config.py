from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "IndustrialGPT OS API"
    API_V1_STR: str = "/api/v1"
    
    # Databases configurations
    DATABASE_URL: str = "postgresql://admin:SecretPassword123@localhost:5432/industrial_db"
    
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "SecretPassword123"
    
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # AI Credentials
    GEMINI_API_KEY: str = "mock-api-key"
    
    # Security config
    SECRET_KEY: str = "SuperSecretCryptographicJWTKey777!!!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    
    model_config = ConfigDict(case_sensitive=True)

settings = Settings()
