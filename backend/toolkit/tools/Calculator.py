from backend.exceptions import InvalidToolCall
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
    when_not_to_use = None
    
    def run(self, operation: str, operand1: int|float, operand2: int|float) -> dict[str, int|float]:        
        if operation == "add": result = operand1 + operand2
        elif operation == "subtract": result = operand1 - operand2
        elif operation == "multiply": result = operand1 * operand2
        elif operation == "divide": result = operand1 / operand2
        else: raise InvalidToolCall()
        
        return {"result": result}
        
