# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Google Gemini
    GOOGLE_API_KEY: str

    # PostgreSQL
    DATABASE_URL: str

    # Express backend callback
    EXPRESS_BASE_URL: str          # e.g. http://localhost:3000
    INTERNAL_API_KEY: str          # shared secret with Express
    GOOGLE_SERVICE_ACCOUNT_JSON: str | None = None 
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()