import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
from openai import OpenAI

from toolkit.all_tools import ALL_TOOLS

load_dotenv()

api_key = os.environ["OPENROUTER_API_KEY"]
model = os.environ.get("LLM_NAME")
provider = os.environ.get("LLM_PROVIDER")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

tool_instances = [ToolClass() for ToolClass in ALL_TOOLS]
tools_api = [tool.to_api() for tool in tool_instances]
tools_by_name = {tool.name: tool for tool in tool_instances}

messages = []

while True:
    try:
        user_input = input("You: ")
    except (KeyboardInterrupt, EOFError):
        break

    messages.append({
        "role": "user",
        "content": user_input
    })

    while True:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=tools_api,
            extra_body={"provider": {"order": [provider.capitalize()]}},
        )

        llm_reply = response.choices[0].message
        messages.append(llm_reply)

        if not llm_reply.tool_calls:
            print(f"AI: {llm_reply.content}")
            break

        for tool_call in llm_reply.tool_calls:
            tool = tools_by_name[tool_call.function.name]
            arguments = json.loads(tool_call.function.arguments)
            result = tool.run(**arguments)
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(result),
            })
