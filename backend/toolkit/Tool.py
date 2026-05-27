from abc import abstractmethod
from typing import Any


class Tool:
    what_it_does: str
    when_to_use: str
    input_schema: dict[str, Any]
    return_schema: dict[str, Any]
    when_not_to_use: str = ""
    
    def to_api(self) -> dict:
        parts = [f'What it does: "{self.what_it_does}"', f'When to use: "{self.when_to_use}"']
        if self.when_not_to_use:
            parts.append(f'When not to use: "{self.when_not_to_use}"')
        if self.return_schema:
            parts.append(f'What it returns: "{self.return_schema}"')
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": " ".join(parts),
                "parameters": self.input_schema,
            },
        }

    @abstractmethod
    def run(self, **kwargs) -> Any:
        ...

    @property
    def name(self) -> str:
        return type(self).__name__
