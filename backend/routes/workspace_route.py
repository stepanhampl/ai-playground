import os
import shutil
from pathlib import Path

from fastapi import APIRouter

from backend.config import WORKSPACE

router = APIRouter()


@router.post("/api/clear-workspace")
async def clear_workspace() -> dict[str, bool]:
    if os.path.exists(WORKSPACE):
        shutil.rmtree(WORKSPACE)
    os.makedirs(WORKSPACE, exist_ok=True)
    (Path(WORKSPACE) / ".gitkeep").touch()
    return {"ok": True}
