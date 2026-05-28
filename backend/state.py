from typing import Any
from backend.config import SYSTEM_MESSAGE

messages: list[dict[str, Any]] = [SYSTEM_MESSAGE]
current_chat_id: int | None = None


def reset() -> None:
    global messages, current_chat_id
    messages = [SYSTEM_MESSAGE]
    current_chat_id = None
