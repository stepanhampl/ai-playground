from openai import OpenAI

from backend.config import OPENROUTER_API_KEY
from backend.toolkit.Tool import Tool
from backend.toolkit.all_tools import ALL_TOOLS

client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_API_KEY)

tool_instances: list[Tool] = [ToolClass() for ToolClass in ALL_TOOLS]
tools_api = [tool.to_api() for tool in tool_instances]
tools_by_name: dict[str, Tool] = {tool.name: tool for tool in tool_instances}
