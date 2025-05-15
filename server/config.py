from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class S3Config(BaseSettings):
    access_key_id: str
    secret_key: str
    region: str
    endpoint_url: str
    bucket: str
    root_directory: str

    model_config = SettingsConfigDict(
        env_prefix="S3_",
        env_file=".env",
    )


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
    # S3
    S3_ACCESS_KEY_ID: str
    S3_SECRET_KEY: str
    S3_REGION: str
    S3_ENDPOINT_URL: str
    S3_BUCKET: str
    S3_ROOT_DIRECTORY: str

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

    @property
    def S3_CONFIG(self) -> S3Config:
        return S3Config(
            access_key_id=self.S3_ACCESS_KEY_ID,
            secret_key=self.S3_SECRET_KEY,
            region=self.S3_REGION,
            endpoint_url=self.S3_ENDPOINT_URL,
            bucket=self.S3_BUCKET,
            root_directory=self.S3_ROOT_DIRECTORY,
        )

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()  # type: ignore
