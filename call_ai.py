import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.environ["OPENROUTER_API_KEY"]
model = os.environ.get("LLM_NAME")
provider = os.environ.get("LLM_PROVIDER")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

response = client.chat.completions.create(
    model=model,
    messages=[{"role": "user", "content": prompt_typed_into_terminal}],
    extra_body={"provider": {"order": [provider.capitalize()]}},
)

print(response.choices[0].message.content)
