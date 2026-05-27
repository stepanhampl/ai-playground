import json
import os
import sys

sys.path.insert(0, "/app")

from dotenv import load_dotenv
from fastapi import FastAPI
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

messages = [SYSTEM_MESSAGE]

app = FastAPI()


class MessageRequest(BaseModel):
    content: str


@app.get("/")
async def index():
    with open("/app/frontend/index.html") as f:
        return HTMLResponse(f.read())


@app.post("/api/message")
async def send_message(req: MessageRequest):
    messages.append({"role": "user", "content": req.content})
    tool_calls_log = []

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

        if not llm_reply.tool_calls:
            return {"content": llm_reply.content, "tool_calls": tool_calls_log}

        for tool_call in llm_reply.tool_calls:
            tool = tools_by_name[tool_call.function.name]
            tool_calls_log.append(tool.name)
            arguments = json.loads(tool_call.function.arguments)
            result = tool.run(**arguments)
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(result),
            })


@app.get("/api/history")
async def get_history():
    return {"messages": [m for m in messages if isinstance(m, dict)]}
