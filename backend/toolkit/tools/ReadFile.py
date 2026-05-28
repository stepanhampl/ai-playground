import os

from backend.toolkit.Tool import Tool


class ReadFile(Tool):
    what_it_does = "Get whole contents of existing file - returned as a single string."
    when_to_use = "When you need to read any file."
    input_schema = {
        "type": "object",
        "properties": {
            "file_path": {
                "type": "string",
                "description": "Absolute path, where the file is located. Includes file name."
            },
            "return_type": {
                "type": "string",
                "enum": ["array", "string"],
                "description": "Do you want to get file contents as string or as array containing row numbers as well as row contents?"
            }
        },
        "required": ["file_path", "return_type"]
    }
    return_schema = {
        "type": "object",
        "properties": {
            "execution_status": {
                "type": "string",
                "enum": ["success", "error"],
                "description": "Flag saying whether the file was successfully edited."
            },
            "message": {
                "type": "string",
                "description": "Explanation of the failure or message about success."
            },
            "file_contents_string": {
                "type": "string",
                "description": "Full file contents in single string."
            },
            "file_contents_json": {
                "type": "array",
                "description": "Full file contents as array of rows.",
                "items": {
                    "type": "object",
                    "properties": {
                        "ordinal": {
                            "type": "integer",
                            "description": "Row number (1-based)."
                        },
                        "contents": {
                            "type": "string",
                            "description": "Row contents."
                        }
                    },
                    "required": ["ordinal", "contents"]
                }
            }
        },
        "required": ["execution_status"]
    }
    when_not_to_use: str = None

    
    def run(self, file_path: str, return_type: str) -> dict:
        if return_type == "array":
            return self.read_file_array(file_path)
        return self.read_file_string(file_path)

    def read_file_string(self, file_path: str) -> dict[str, str]:
        if not os.path.isabs(file_path):
            return {"execution_status": "error", "message": f"file_path must be absolute, got: {file_path}"}
        try:
            with open(file_path, 'r') as file:
                content = file.read()
            return {"execution_status": "success", "file_contents_string": content}
        except FileNotFoundError:
            return {"execution_status": "error", "message": f"File not found: {file_path}"}
        except OSError as e:
            return {"execution_status": "error", "message": str(e)}

    def read_file_array(self, file_path: str) -> dict:
        if not os.path.isabs(file_path):
            return {"execution_status": "error", "message": f"file_path must be absolute, got: {file_path}"}
        try:
            with open(file_path, 'r') as file:
                lines = file.readlines()
            rows = [{"ordinal": i + 1, "contents": line.rstrip("\n")} for i, line in enumerate(lines)]
            return {"execution_status": "success", "file_contents_json": rows}
        except FileNotFoundError:
            return {"execution_status": "error", "message": f"File not found: {file_path}"}
        except OSError as e:
            return {"execution_status": "error", "message": str(e)}

