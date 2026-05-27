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

messages = []

while True:
    try:
        user_input = input("You: ")
    except (KeyboardInterrupt, EOFError):
        break

    messages.append({"role": "user", "content": user_input})

    response = client.chat.completions.create(
        model=model,
        messages=messages,
        extra_body={"provider": {"order": [provider.capitalize()]}},
    )

    reply = response.choices[0].message.content
    messages.append({"role": "assistant", "content": reply})
    print(f"AI: {reply}")

# TODO - add calculator tool
