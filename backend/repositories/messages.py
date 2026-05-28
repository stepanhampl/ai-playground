import json
from typing import Any

from backend.database import get_db, now_iso


def _insert(chat_id: int, role: str, content: str | None, raw_json: str) -> None:
    with get_db() as conn:
        conn.execute(
            "INSERT INTO chat_messages (chat_id, role, content, raw_json, created_at) VALUES (?,?,?,?,?)",
            (chat_id, role, content, raw_json, now_iso()),
        )


def save_msg(chat_id: int, msg: dict[str, Any]) -> None:
    _insert(chat_id, msg["role"], msg.get("content"), json.dumps(msg))


def get_all_by_chat(chat_id: int) -> list[dict[str, Any]]:
    with get_db() as conn:
        rows = conn.execute(
            "SELECT role, content, raw_json FROM chat_messages WHERE chat_id=? ORDER BY id",
            (chat_id,),
        ).fetchall()
        return [dict(r) for r in rows]
