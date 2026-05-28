import sys

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


@app.get("/")
async def index() -> HTMLResponse:
    with open("/app/frontend/index.html") as f:
        return HTMLResponse(f.read())
