from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "ClaimFlow AI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./claimflow.db"
    SYNC_DATABASE_URL: str = "sqlite:///./claimflow.db"

    # LLM Configuration
    MOCK_LLM: bool = True
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    # LangGraph Checkpointer
    CHECKPOINT_DB_PATH: str = "./checkpoints.db"

    # Adjudication Rules
    STP_MAX_NET_PAYOUT: float = 2000.00
    STP_MAX_FRAUD_SCORE: float = 30.00
    POLICY_BIND_SUSPICIOUS_DAYS: int = 15

    # Simulated Guidewire Webhook
    GUIDEWIRE_WEBHOOK_URL: str = "https://claimcenter.mock.valuemomentum.internal/api/claims/v1"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
