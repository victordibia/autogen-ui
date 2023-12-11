from dataclasses import field
from typing import Any, Dict, List, Optional, Union
from pydantic.dataclasses import dataclass


@dataclass
class GenerateWebRequest:
    """Project data model"""

    prompt: str
    history: Optional[str] = None


@dataclass
class LLMConfig:
    """Data model for LLM Config for Autogen"""
    seed: int = 42 # set to `None` to disable caching
    config_list: List[Dict[str, Any]] = field(
        default_factory=list)  # a list of OpenAI API configurations
    temperature: float = 0
    request_timeout: Optional[int] = None


@dataclass
class AgentConfig:
    """Data model for Agent Config for Autogen"""
    name: str
    llm_config: LLMConfig
    human_input_mode: str = "NEVER"
    max_consecutive_auto_reply: int = 10
    is_termination_msg: Union[bool, str] = None
    code_execution_config: Optional[Union[bool, str, Dict[str, Any]]] = None


@dataclass
class AgentFlowSpec:
    """Data model to help flow load agents from config"""
    type: str  # "assistant" | "user_proxy" | "group_chat"
    config: AgentConfig = field(default_factory=AgentConfig)


@dataclass
class FlowConfig:
    """Data model for Flow Config for Autogen"""
    name: str
    sender: AgentConfig
    receiver: Union[AgentConfig, List[AgentConfig]]
