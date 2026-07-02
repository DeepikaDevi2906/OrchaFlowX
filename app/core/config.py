from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name:str
    database_url:str
    rabbitmq_host:str
    rabbitmq_port:int
    redis_host: str
    redis_port: int
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )
settings = Settings()