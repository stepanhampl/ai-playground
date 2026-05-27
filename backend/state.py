from backend.config import SYSTEM_MESSAGE

messages: list = [SYSTEM_MESSAGE]
current_chat_id: int | None = None


def reset():
    global messages, current_chat_id
    messages = [SYSTEM_MESSAGE]
    current_chat_id = None
