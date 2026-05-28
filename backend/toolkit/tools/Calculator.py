from typing import Any
from backend.toolkit.Tool import Tool


class Calculator(Tool):
    what_it_does = 'Can add, subtract, multiply and divide any number.'
    when_to_use = "Always when you need to perform any of the operations mentioned. Never try to compute it by yourself."
    input_schema = {
        "type": "object",
        "properties": {
            "operation": {
                "type": "string",
                "enum": ["add", "subtract", "multiply", "divide"],
                "description": "The arithmetic operation to perform"
            },
            "operand1": {
                "type": "number",
                "description": "The first operand"
            },
            "operand2": {
                "type": "number",
                "description": "The second operand"
            }
        },
        "required": ["operation", "operand1", "operand2"]
    }
    return_schema = {
        "type": "object",
        "properties": {
            "result": {
                "type": "number",
                "description": "The result of the calculation."
            }
        },
        "required": ["result"]
    }
    def run(self, **kwargs: Any) -> Any:
        operation: str = kwargs["operation"]
        operand1: int|float = kwargs["operand1"]
        operand2: int|float = kwargs["operand2"]
        if operation == "add": result = operand1 + operand2
        elif operation == "subtract": result = operand1 - operand2
        elif operation == "multiply": result = operand1 * operand2
        elif operation == "divide": result = operand1 / operand2
        else:
            return {
                "error": f"Unknown operation '{operation}'. Use add, subtract, multiply, or divide.",
                "result": None
            }

        return {"result": result}
        
