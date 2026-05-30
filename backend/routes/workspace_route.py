import os
import shutil
from pathlib import Path

from fastapi import APIRouter

from backend.config import WORKSPACE

router = APIRouter()


@router.post("/api/clear-workspace")
async def clear_workspace() -> dict[str, bool]:
    os.makedirs(WORKSPACE, exist_ok=True)
    for item in Path(WORKSPACE).iterdir():
        if item.is_dir():
            shutil.rmtree(item)
        else:
            item.unlink()
    (Path(WORKSPACE) / ".gitkeep").touch()
    return {"ok": True}
