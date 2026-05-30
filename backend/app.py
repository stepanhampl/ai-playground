import sys
import time
import json
import os

sys.path.insert(0, "/app")

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from backend.database import init_db
from backend.routes import messages_route, chats_route, workspace_route

init_db()

app = FastAPI()

# ── React build (Vite dist/) ───────────────────────────────────────────────
_DIST = "/app/frontend/dist"
_MANIFEST_PATH = os.path.join(_DIST, ".vite", "manifest.json")
_MANIFEST = None

if os.path.exists(_MANIFEST_PATH):
    with open(_MANIFEST_PATH) as f:
        _MANIFEST = json.load(f)

app.mount("/assets", StaticFiles(directory=os.path.join(_DIST, "assets")), name="assets")

app.include_router(messages_route.router)
app.include_router(chats_route.router)
app.include_router(workspace_route.router)


@app.get("/")
async def index() -> HTMLResponse:
    index_path = os.path.join(_DIST, "index.html")
    with open(index_path) as f:
        html = f.read()
    return HTMLResponse(html, headers={"Cache-Control": "no-store"})
