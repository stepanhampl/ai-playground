import json
from typing import Any, cast

from fastapi import APIRouter
from pydantic import BaseModel

import backend.state as state
from backend.config import LLM_MODEL, LLM_PROVIDERS
from backend.llm import client, tools_api, tools_by_name
from backend.repositories import chats as chats_repo
from backend.repositories import messages as messages_repo

router = APIRouter()


class MessageRequest(BaseModel):
    content: str


def _record_user_message(content: str) -> None:
    state.messages.append({"role": "user", "content": content})
    if state.current_chat_id is None:
        state.current_chat_id = chats_repo.create(content[:60])
        assert state.current_chat_id is not None
    messages_repo.save_msg(state.current_chat_id, {"role": "user", "content": content})


def _call_llm() -> Any:
    model_arg: Any = LLM_MODEL
    return client.chat.completions.create(
        model=cast(Any, model_arg),
        messages=cast(Any, state.messages),
        tools=cast(Any, tools_api),
        extra_body={"provider": {"order": LLM_PROVIDERS, "allow_fallbacks": True}},
    ).choices[0].message


def _execute_tool_call(tool_call: Any) -> str:
    assert state.current_chat_id is not None
    chat_id: int = state.current_chat_id
    tool = tools_by_name[tool_call.function.name]
    result = tool.run(**json.loads(tool_call.function.arguments))
    tool_msg = {"role": "tool", "tool_call_id": tool_call.id, "content": str(result)}
    state.messages.append(tool_msg)
    messages_repo.save_msg(chat_id, tool_msg)
    return tool.name


def _llm_reply_to_dict(llm_reply: Any) -> dict[str, Any]:
    msg: dict[str, Any] = {"role": llm_reply.role, "content": llm_reply.content}
    if llm_reply.tool_calls:
        msg["tool_calls"] = [
            {"id": tc.id, "type": "function", "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
            for tc in llm_reply.tool_calls
        ]
    return msg


def _run_llm_loop() -> tuple[str, list[str]]:
    tool_calls_log: list[str] = []
    assert state.current_chat_id is not None
    while True:
        llm_reply = _call_llm()
        llm_reply_dict = _llm_reply_to_dict(llm_reply)
        state.messages.append(llm_reply_dict)
        messages_repo.save_msg(state.current_chat_id, llm_reply_dict)

        if not llm_reply.tool_calls:
            chats_repo.update_timestamp_by_id(state.current_chat_id)
            return llm_reply.content, tool_calls_log

        for tool_call in llm_reply.tool_calls:
            tool_calls_log.append(_execute_tool_call(tool_call))


@router.post("/api/message")
async def send_message(req: MessageRequest) -> dict[str, Any]:
    _record_user_message(req.content)
    content, tool_calls = _run_llm_loop()
    return {"content": content, "tool_calls": tool_calls}


@router.post("/api/reset")
async def reset_memory() -> dict[str, bool]:
    state.reset()
    return {"ok": True}


@router.get("/api/history")
async def get_history() -> dict[str, list[dict[str, Any]]]:
    return {"messages": state.messages}
