import os

from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.environ["OPENROUTER_API_KEY"]
LLM_MODEL = os.environ.get("LLM_NAME")
LLM_PROVIDERS = os.environ.get("LLM_PROVIDERS", "Fireworks").split(",")

DB_PATH = "/app/backend/chats.db"
WORKSPACE = "/workspace"

SYSTEM_MESSAGE = {
    "role": "system",
    "content": "Your workspace for all file operations is /workspace. Use only paths under /workspace/ when creating or editing files.",
}
