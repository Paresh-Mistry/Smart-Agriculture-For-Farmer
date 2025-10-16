from pydantic import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Smart Agriculture For Farmer"
    DATABASE_URL: str
    SECRET_KEY: str = "your_secret_key"
    ALGORITHM: str = "HS256"
    DEBUG: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
