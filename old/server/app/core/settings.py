from pydantic import BaseModel
import os

class Settings(BaseModel):
    cors_origins: list[str] = ["http://localhost:5173","http://localhost:5174"]
    api_prefix: str = "/api/v1"
    env: str = os.getenv("ENV","local")

settings = Settings()
