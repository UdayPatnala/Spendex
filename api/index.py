from __future__ import annotations

from backend.app.main import app as spedex_app

SERVICE_PREFIX = "/_/backend"


def normalize_path(path: str) -> str:
    if not path:
        return "/"

    if path.startswith(SERVICE_PREFIX):
        stripped = path[len(SERVICE_PREFIX) :]
        return stripped or "/"

    if path.startswith("/api"):
        return path

    return "/api" if path == "/" else f"/api{path}"


async def app(scope, receive, send):
    if scope["type"] in {"http", "websocket"}:
        path = normalize_path(scope.get("path", ""))

        updated_scope = dict(scope)
        updated_scope["path"] = path

        raw_path = scope.get("raw_path")
        if raw_path is not None:
            normalized_raw_path = normalize_path(raw_path.decode("utf-8"))
            updated_scope["raw_path"] = normalized_raw_path.encode("utf-8")

        scope = updated_scope

    await spedex_app(scope, receive, send)
