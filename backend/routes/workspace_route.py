import os
import shutil

from fastapi import APIRouter

from backend.config import WORKSPACE

router = APIRouter()


@router.post("/api/clear-workspace")
async def clear_workspace():
    for entry in os.scandir(WORKSPACE):
        if entry.name == ".gitkeep":
            continue
        if entry.is_dir(follow_symlinks=False):
            shutil.rmtree(entry.path)
        else:
            os.remove(entry.path)
    return {"ok": True}
