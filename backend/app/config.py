from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

if os.getenv("VERCEL"):
    DEFAULT_SQLITE_PATH = Path("/tmp/ledger.db")
else:
    DEFAULT_SQLITE_PATH = (BASE_DIR / "ledger.db").resolve()

DEFAULT_SQLITE = DEFAULT_SQLITE_PATH.as_posix()


@dataclass(frozen=True)
class Settings:
    app_name: str = "Ledger API"
    api_prefix: str = "/api"
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE}")
    secret_key: str = os.getenv("LEDGER_SECRET_KEY", "ledger-dev-secret")
    token_expire_minutes: int = int(os.getenv("LEDGER_TOKEN_EXPIRE_MINUTES", "1440"))
    cors_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv(
            "LEDGER_CORS_ORIGINS",
            "http://localhost:3000,http://localhost:5173,http://localhost:8081,exp://127.0.0.1:19000",
        ).split(",")
        if origin.strip()
    )


settings = Settings()
