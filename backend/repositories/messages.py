import json

from backend.database import get_db, now_iso


def _insert(chat_id: int, role: str, content, raw_json: str):
    with get_db() as conn:
        conn.execute(
            "INSERT INTO chat_messages (chat_id, role, content, raw_json, created_at) VALUES (?,?,?,?,?)",
            (chat_id, role, content, raw_json, now_iso()),
        )


def save_msg(chat_id: int, msg: dict):
    _insert(chat_id, msg["role"], msg.get("content"), json.dumps(msg))


def get_all_by_chat(chat_id: int) -> list:
    with get_db() as conn:
        return conn.execute(
            "SELECT role, content, raw_json FROM chat_messages WHERE chat_id=? ORDER BY id",
            (chat_id,),
        ).fetchall()
