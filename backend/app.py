import sys
import time

sys.path.insert(0, "/app")

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from backend.database import init_db
from backend.routes import messages_route, chats_route, workspace_route

init_db()

app = FastAPI()
app.mount("/static", StaticFiles(directory="/app/frontend/static"), name="static")

app.include_router(messages_route.router)
app.include_router(chats_route.router)
app.include_router(workspace_route.router)

_BUILD_TS = int(time.time())


@app.get("/")
async def index() -> HTMLResponse:
    with open("/app/frontend/index.html") as f:
        html = f.read().replace(
            'src="/static/js/main.js"',
            f'src="/static/js/main.js?v={_BUILD_TS}"',
        ).replace(
            'href="/static/css/style.css"',
            f'href="/static/css/style.css?v={_BUILD_TS}"',
        )
    return HTMLResponse(html, headers={"Cache-Control": "no-store"})
