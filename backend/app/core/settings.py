import os
from typing import ClassVar
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_NAME: str = os.getenv("DATABASE_NAME")
    APP_NAME: str = "Smart Agriculture For Farmer"
    VERSION: str = "1.0.0"
    DATABASE_URL: str
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM")
    DEBUG: bool = True
    OTP_EXPIRY_MINUTES: ClassVar[int] = 5  
    SMTP_PORT: int = 587
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_EMAIL: str = os.getenv("SMTP_EMAIL")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD")
    OLLAMA_API_URL: str = os.getenv("OLLAMA_API_URL")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")

    class Config:
        env_file = ".env"
        case_sensitive: False

settings = Settings()
