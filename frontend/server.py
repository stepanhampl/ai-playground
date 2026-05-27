import json
import os
import shutil
import sqlite3
import sys
from datetime import datetime, timezone

sys.path.insert(0, "/app")

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from openai import OpenAI
from pydantic import BaseModel

from backend.toolkit.all_tools import ALL_TOOLS

load_dotenv()

api_key = os.environ["OPENROUTER_API_KEY"]
model = os.environ.get("LLM_NAME")
providers = os.environ.get("LLM_PROVIDERS", "").split(",")

client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=api_key)

tool_instances = [ToolClass() for ToolClass in ALL_TOOLS]
tools_api = [tool.to_api() for tool in tool_instances]
tools_by_name = {tool.name: tool for tool in tool_instances}

SYSTEM_MESSAGE = {
    "role": "system",
    "content": "Your workspace for all file operations is /workspace. Use only paths under /workspace/ when creating or editing files.",
}

DB_PATH = "/app/backend/chats.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS chats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                created_at DATETIME,
                updated_at DATETIME
            );
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
                role TEXT,
                content TEXT,
                raw_json TEXT,
                created_at DATETIME
            );
        """)


init_db()

messages = [SYSTEM_MESSAGE]
current_chat_id = None

app = FastAPI()


class MessageRequest(BaseModel):
    content: str


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def serialize_msg(msg):
    if isinstance(msg, dict):
        return json.dumps(msg)
    return json.dumps(msg.model_dump())


def save_msg_row(conn, chat_id, msg):
    role = msg.get("role") if isinstance(msg, dict) else getattr(msg, "role", None)
    content = msg.get("content") if isinstance(msg, dict) else getattr(msg, "content", None)
    conn.execute(
        "INSERT INTO chat_messages (chat_id, role, content, raw_json, created_at) VALUES (?,?,?,?,?)",
        (chat_id, role, content, serialize_msg(msg), now_iso()),
    )


@app.get("/")
async def index():
    with open("/app/frontend/index.html") as f:
        return HTMLResponse(f.read())


@app.post("/api/message")
async def send_message(req: MessageRequest):
    global messages, current_chat_id

    messages.append({"role": "user", "content": req.content})
    tool_calls_log = []

    with get_db() as conn:
        if current_chat_id is None:
            ts = now_iso()
            cursor = conn.execute(
                "INSERT INTO chats (title, created_at, updated_at) VALUES (?,?,?)",
                (req.content[:60], ts, ts),
            )
            current_chat_id = cursor.lastrowid

        conn.execute(
            "INSERT INTO chat_messages (chat_id, role, content, raw_json, created_at) VALUES (?,?,?,?,?)",
            (current_chat_id, "user", req.content, json.dumps({"role": "user", "content": req.content}), now_iso()),
        )

        while True:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                tools=tools_api,
                max_tokens=4096,
                extra_body={"provider": {"order": providers, "allow_fallbacks": True}},
            )

            llm_reply = response.choices[0].message
            messages.append(llm_reply)
            save_msg_row(conn, current_chat_id, llm_reply)

            if not llm_reply.tool_calls:
                conn.execute(
                    "UPDATE chats SET updated_at=? WHERE id=?",
                    (now_iso(), current_chat_id),
                )
                return {"content": llm_reply.content, "tool_calls": tool_calls_log}

            for tool_call in llm_reply.tool_calls:
                tool = tools_by_name[tool_call.function.name]
                tool_calls_log.append(tool.name)
                arguments = json.loads(tool_call.function.arguments)
                result = tool.run(**arguments)
                tool_msg = {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": str(result),
                }
                messages.append(tool_msg)
                save_msg_row(conn, current_chat_id, tool_msg)


@app.get("/api/chats")
async def list_chats():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, title, updated_at FROM chats ORDER BY updated_at DESC"
        ).fetchall()
    return {"chats": [dict(r) for r in rows]}


@app.delete("/api/chats/{chat_id}")
async def delete_chat(chat_id: int):
    global messages, current_chat_id
    with get_db() as conn:
        conn.execute("DELETE FROM chats WHERE id=?", (chat_id,))
    if current_chat_id == chat_id:
        messages = [SYSTEM_MESSAGE]
        current_chat_id = None
    return {"ok": True}


@app.post("/api/chats/{chat_id}/restore")
async def restore_chat(chat_id: int):
    global messages, current_chat_id
    with get_db() as conn:
        chat = conn.execute("SELECT id FROM chats WHERE id=?", (chat_id,)).fetchone()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        rows = conn.execute(
            "SELECT role, content, raw_json FROM chat_messages WHERE chat_id=? ORDER BY id",
            (chat_id,),
        ).fetchall()

    restored = [SYSTEM_MESSAGE]
    display_messages = []
    for row in rows:
        raw = json.loads(row["raw_json"])
        # Rebuild a clean dict with only fields the API accepts
        msg = {"role": raw["role"], "content": raw.get("content")}
        if raw.get("tool_calls"):
            msg["tool_calls"] = raw["tool_calls"]
        if raw.get("tool_call_id"):
            msg["tool_call_id"] = raw["tool_call_id"]
        restored.append(msg)
        if row["role"] in ("user", "assistant"):
            display_messages.append({"role": row["role"], "content": row["content"] or ""})

    messages = restored
    current_chat_id = chat_id
    return {"messages": display_messages}


WORKSPACE = "/workspace"


@app.post("/api/clear-workspace")
async def clear_workspace():
    for entry in os.scandir(WORKSPACE):
        if entry.name == ".gitkeep":
            continue
        if entry.is_dir(follow_symlinks=False):
            shutil.rmtree(entry.path)
        else:
            os.remove(entry.path)
    return {"ok": True}


@app.post("/api/reset")
async def reset_memory():
    global messages, current_chat_id
    messages = [SYSTEM_MESSAGE]
    current_chat_id = None
    return {"ok": True}


@app.get("/api/history")
async def get_history():
    return {"messages": [m for m in messages if isinstance(m, dict)]}
