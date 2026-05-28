import os

from backend.toolkit.Tool import Tool


class CreateFile(Tool):
    what_it_does = "Creates new file with contents."
    when_to_use = "When you need to create any new file in your workflow."
    input_schema = {
        "type": "object",
        "properties": {
            "file_path": {
                "type": "string",
                "description": "Absolute, where the file will be located. Includes file name"
            },
            "file_contents": {
                "type": "string",
                "description": "All the contents, which you want to put into the file (initialize the file with content). Empty string for empty file."
            },
        },
        "required": ["file_path", "file_contents"]
    }
    return_schema = {
        "type": "object",
        "properties": {
            "execution_status": {
                "type": "string",
                "enum": ["success", "error"],
                "description": "Flag saying whether the file was successfully created."
            },
            "error_message": {
                "type": "string",
                "description": "Explanation of the failure. Present only when execution_status is 'error'."
            }
        },
        "required": ["execution_status"]
    }
    when_not_to_use: str = "Do not use when you want to edit existing file."

    def run(self, **kwargs) -> dict:
        file_path: str = kwargs["file_path"]
        file_contents: str = kwargs["file_contents"]
        if not os.path.isabs(file_path):
            return {"execution_status": "error", "error_message": f"file_path must be absolute, got: {file_path}"}
        try:
            with open(file_path, "x") as f:
                f.write(file_contents)
            return {"execution_status": "success", "file_path": file_path}
        except FileExistsError:
            return {"execution_status": "error", "error_message": f"File already exists: {file_path}"}
        except OSError as e:
            return {"execution_status": "error", "error_message": str(e)}

