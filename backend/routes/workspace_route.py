import os
import shutil
from pathlib import Path

from fastapi import APIRouter

from backend.config import WORKSPACE

router = APIRouter()


@router.post("/api/clear-workspace")
async def clear_workspace() -> dict[str, bool]:
    if os.path.exists(WORKSPACE):
        for entry in os.scandir(WORKSPACE):
            if entry.name == ".gitkeep":
                continue
            if entry.is_dir(follow_symlinks=False):
                shutil.rmtree(entry.path)
            else:
                os.remove(entry.path)
    else:
        os.makedirs(WORKSPACE, exist_ok=True)
    (Path(WORKSPACE) / ".gitkeep").touch()
    return {"ok": True}
