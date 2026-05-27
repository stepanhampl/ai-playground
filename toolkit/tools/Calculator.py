from exceptions import InvalidToolCall
from toolkit.Tool import Tool


class Calculator(Tool):
    name = "calculator"
    what_it_does = 'Can add, subtract, multiply and divide any number.'
    when_to_use = "When you need to perform any of the operations mentioned."
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
    returns = "Result of the calculation."
    when_not_to_use = None
    
    def run(self, operation: str, operand1: int|float, operand2: int|float) -> int|float:
        if operation == "add": return operand1 + operand2
        elif operation == "subtract": return operand1 - operand2
        elif operation == "multiply": return operand1 * operand2
        elif operation == "divide": return operand1 / operand2
        else: raise InvalidToolCall
        
        
