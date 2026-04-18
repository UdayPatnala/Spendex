from __future__ import annotations

# NOTE: The actual backend is a Java Spring Boot app deployed on Render at
# https://spedex.onrender.com — the frontend calls it directly via api.ts.
# This file is not used in production routing. It's kept as a no-op ASGI
# stub so Vercel does not error on import during any introspection step.

import json


async def app(scope, receive, send):
    """Minimal ASGI stub — real backend lives on Render."""
    if scope["type"] == "http":
        await receive()  # consume the request body
        body = json.dumps({
            "detail": "This endpoint is not active. The Spedex API is hosted at https://spedex.onrender.com"
        }).encode()
        await send({
            "type": "http.response.start",
            "status": 302,
            "headers": [
                [b"location", b"https://spedex.onrender.com" + scope.get("path", "/").encode()],
                [b"content-type", b"application/json"],
            ],
        })
        await send({"type": "http.response.body", "body": body})
