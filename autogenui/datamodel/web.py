from typing import Optional
from pydantic.dataclasses import dataclass


@dataclass
class GenerateWebRequest:
    """Project data model"""

    prompt: str
    history: Optional[str] = None
    session_id: Optional[str] = None
