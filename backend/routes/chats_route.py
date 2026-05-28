import json
from typing import Any

from fastapi import APIRouter, HTTPException

import backend.state as state
from backend.config import SYSTEM_MESSAGE
from backend.repositories import chats as chats_repo
from backend.repositories import messages as messages_repo

router = APIRouter()


@router.get("/api/chats")
async def list_chats() -> dict[str, list[dict[str, Any]]]:
    return {"chats": chats_repo.list_all()}


@router.delete("/api/chats/{chat_id}")
async def delete_chat(chat_id: int) -> dict[str, bool]:
    chats_repo.delete_by_id(chat_id)
    if state.current_chat_id == chat_id:
        state.reset()
    return {"ok": True}


@router.post("/api/chats/{chat_id}/restore")
async def restore_chat(chat_id: int) -> dict[str, list[dict[str, Any]]]:
    if not chats_repo.get_by_id(chat_id):
        raise HTTPException(status_code=404, detail="Chat not found")

    rows = messages_repo.get_all_by_chat(chat_id)

    restored = [SYSTEM_MESSAGE]
    display_messages = []
    for row in rows:
        raw = json.loads(row["raw_json"])
        msg = {"role": raw["role"], "content": raw.get("content")}
        if raw.get("tool_calls"):
            msg["tool_calls"] = raw["tool_calls"]
        if raw.get("tool_call_id"):
            msg["tool_call_id"] = raw["tool_call_id"]
        restored.append(msg)
        if row["role"] in ("user", "assistant"):
            display_messages.append({"role": row["role"], "content": row["content"] or ""})

    state.messages = restored
    state.current_chat_id = chat_id
    return {"messages": display_messages}
