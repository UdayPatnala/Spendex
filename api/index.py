from __future__ import annotations

from backend.app.main import app as ledger_app


async def app(scope, receive, send):
    if scope["type"] in {"http", "websocket"}:
        path = scope.get("path", "")
        if path == "":
            path = "/"

        updated_scope = dict(scope)
        updated_scope["path"] = f"/api{path}" if path != "/" else "/api"

        raw_path = scope.get("raw_path")
        if raw_path is not None:
            updated_scope["raw_path"] = f"/api{raw_path.decode('utf-8')}".encode("utf-8")

        scope = updated_scope

    await ledger_app(scope, receive, send)
