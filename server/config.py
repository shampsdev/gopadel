from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str
    TG_API_TOKEN: str
    TRUSTED_API_TOKENS: list[str]
    SHOP_ID: str
    SHOP_SECRET: str
    FRONTEND_URL: str
    DEBUG: bool = False
    ADMINS_IDS: list[int]
    WEBAPP_URL: str

    @property
    def SQLALCHEMY_DATABASE_URI(self):
        return MultiHostUrl.build(
            scheme="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_HOST,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()  # type: ignore
