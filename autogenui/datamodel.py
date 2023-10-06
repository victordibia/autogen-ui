from dataclasses import field
from typing import Any, Dict, List, Optional, Union
from pydantic.dataclasses import dataclass


@dataclass
class GenerateWebRequest:
    """Project data model"""

    prompt: str
