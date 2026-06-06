import logging

# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    groq_api_key: str
    hindsight_api_key: str
    hindsight_project_id: str
    groq_model: str = "llama-3.3-70b-versatile"
    hindsight_top_k: int = 3
    max_tokens: int = 1024
    app_title: str = "Incident Response Agent"
    app_version: str = "1.0.0"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
