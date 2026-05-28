from backend.database import get_db, now_iso


def create(title: str) -> int | None:
    ts = now_iso()
    with get_db() as conn:
        cursor = conn.execute(
            "INSERT INTO chats (title, created_at, updated_at) VALUES (?,?,?)",
            (title, ts, ts),
        )
        return cursor.lastrowid


def update_timestamp_by_id(chat_id: int):
    with get_db() as conn:
        conn.execute("UPDATE chats SET updated_at=? WHERE id=?", (now_iso(), chat_id))


def list_all() -> list[dict]:
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, title, updated_at FROM chats ORDER BY updated_at DESC"
        ).fetchall()
    return [dict(r) for r in rows]


def get_by_id(chat_id: int):
    with get_db() as conn:
        return conn.execute("SELECT id FROM chats WHERE id=?", (chat_id,)).fetchone()


def delete_by_id(chat_id: int):
    with get_db() as conn:
        conn.execute("DELETE FROM chats WHERE id=?", (chat_id,))
