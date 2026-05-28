from backend.toolkit.Tool import Tool
from backend.toolkit.tools.EditFileByDiff import EditFileByDiff
from backend.toolkit.tools.Calculator import Calculator
from backend.toolkit.tools.CreateFile import CreateFile
from backend.toolkit.tools.ReadFile import ReadFile

ALL_TOOLS: list[type[Tool]] = [
    Calculator,
    CreateFile,
    EditFileByDiff,
    ReadFile,
]
