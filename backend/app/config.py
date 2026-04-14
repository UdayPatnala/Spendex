from __future__ import annotations

import os
import warnings
from dataclasses import dataclass
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

if os.getenv("VERCEL"):
    DEFAULT_SQLITE_PATH = Path("/tmp/spedex.db")
else:
    DEFAULT_SQLITE_PATH = (BASE_DIR / "spedex.db").resolve()

DEFAULT_SQLITE = DEFAULT_SQLITE_PATH.as_posix()

_DEV_SECRET = "spedex-dev-secret"


@dataclass(frozen=True)
class Settings:
    app_name: str = "Spedex API"
    api_prefix: str = "/api"
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE}")
    secret_key: str = os.getenv("SPEDEX_SECRET_KEY", os.getenv("LEDGER_SECRET_KEY", _DEV_SECRET))
    token_expire_minutes: int = int(
        os.getenv("SPEDEX_TOKEN_EXPIRE_MINUTES", os.getenv("LEDGER_TOKEN_EXPIRE_MINUTES", "1440"))
    )
    cors_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv(
            "SPEDEX_CORS_ORIGINS",
            os.getenv(
                "LEDGER_CORS_ORIGINS",
                "http://localhost:3000,http://localhost:5173,http://localhost:8081,exp://127.0.0.1:19000",
            ),
        ).split(",")
        if origin.strip()
    )


settings = Settings()

if settings.secret_key == _DEV_SECRET:
    warnings.warn(
        "SPEDEX_SECRET_KEY is using the insecure default value. "
        "Set a strong secret via the SPEDEX_SECRET_KEY environment variable before deploying to production.",
        stacklevel=1,
    )
