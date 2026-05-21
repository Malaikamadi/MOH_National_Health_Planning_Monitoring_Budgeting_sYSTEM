"""Application configuration.

We use Pydantic Settings so config is *validated* at startup. A bad env var
fails the container immediately rather than producing mysterious errors at
request time.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn, RedisDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ----- Application -----
    app_env: Literal["dev", "test", "stage", "prod"] = "dev"
    app_name: str = "nhpmbr"
    app_debug: bool = False
    app_log_level: str = "INFO"
    app_base_url: str = "http://localhost:8000"
    # Raw comma-separated string from env (e.g. "http://localhost:3000,http://example.com").
    # The parsed list is exposed by the `app_cors_origins` computed field below.
    app_cors_origins_raw: str = Field(
        default="http://localhost:3000",
        alias="app_cors_origins",
    )

    @computed_field  # type: ignore[prop-decorator]
    @property
    def app_cors_origins(self) -> list[str]:
        return [o.strip() for o in self.app_cors_origins_raw.split(",") if o.strip()]

    # ----- API -----
    api_host: str = "0.0.0.0"  # noqa: S104 - intentional
    api_port: int = 8000

    # ----- Database -----
    database_url: PostgresDsn
    sync_database_url: PostgresDsn

    # ----- Redis -----
    redis_url: RedisDsn = Field(default="redis://localhost:6379/0")

    # ----- Object storage -----
    s3_endpoint: str = "http://localhost:9000"
    s3_region: str = "us-east-1"
    s3_bucket: str = "nhpmbr-dev"
    s3_access_key: str = "nhpmbr_minio"
    s3_secret_key: str = "nhpmbr_minio_dev_password_change_me"
    s3_use_ssl: bool = False
    s3_public_url: str = "http://localhost:9000"

    # ----- Identity -----
    oidc_issuer: str = "http://localhost:8080/realms/nhpmbr"
    oidc_audience: str = "nhpmbr-api"
    oidc_jwks_url: str = "http://localhost:8080/realms/nhpmbr/protocol/openid-connect/certs"
    oidc_client_id: str = "nhpmbr-web"
    oidc_client_secret: str = ""

    jwt_dev_secret: str = "dev-only-secret-do-not-use-in-staging-or-prod"
    jwt_algorithm: str = "HS256"
    jwt_access_token_ttl_seconds: int = 900
    jwt_refresh_token_ttl_seconds: int = 604_800

    # ----- Telemetry -----
    otel_exporter_otlp_endpoint: str | None = None
    otel_service_name: str = "nhpmbr-api"
    sentry_dsn: str | None = None

    # ----- Derived -----
    @computed_field  # type: ignore[prop-decorator]
    @property
    def is_production(self) -> bool:
        return self.app_env == "prod"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def is_dev_like(self) -> bool:
        return self.app_env in {"dev", "test"}


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached settings accessor. Imported as `settings = get_settings()` in routers."""
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
