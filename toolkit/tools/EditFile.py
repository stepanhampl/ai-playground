import os

from toolkit.Tool import Tool


class EditFile(Tool):
    what_it_does = "Edits existing file. Works by replacing existing string by new one."
    when_to_use = "When you need to edit any file in your workflow."
    input_schema = {
        "type": "object",
        "properties": {
            "file_path": {
                "type": "string",
                "description": "Absolute, where the file will be located. Includes file name."
            },
            "string_to_replace": {
                "type": "string",
                "description": "This string will be searched in the file and replaced by new_string. Must be unique across whole file - you might need to include more context around, if not unique."
            },
            "new_string": {
                "type": "string",
                "description": "This will replace string_to_replace."
            },
            "replace_all": {
                "type": "boolean",
                "description": "Send 'true', if you want to replace all occurences at once. Default is 'false'"
            }
        },
        "required": ["file_path", "string_to_replace", "new_string"]
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
            }
        },
        "required": ["execution_status"]
    }
    when_not_to_use: str = "Do not use when you want to create existing file."

    def run(self, file_path: str, string_to_replace: str, new_string: str, replace_all: bool = False) -> dict[str, str]:
        with open(file_path, 'r') as file:
            content = file.read()
            
        occur_count = content.count(string_to_replace)
        if occur_count == 0: 
            return {
                "execution_status": "error",
                "message": "No occurence of string_to_replace found."
            }
        if occur_count > 1 and not replace_all:
            return {
                "execution_status": "error",
                "message": "More than one occurence of string_to_replace found. Try to include more context around the string_to_replace. Also you might consider setting replace_all=true, if it is such intent."
            }

        new_content = content.replace(string_to_replace, new_string, -1)
        
        with open(file_path, 'w') as file: 
            file.write(new_content)
            
        return {
            "execution_status": "success",
            "message": "The file was successfully edited."
        }
