from dataclasses import asdict
import autogen

from typing import Union, List
import autogen
from autogenui.datamodel import AgentFlowSpec, AgentConfig


class Flow:
    """
    A class to represent a flow involving a sender and a receiver or multiple receivers.

    Attributes:
        sender (AgentConfig): The sender agent configuration.
        receiver (Union[AgentConfig, List[AgentConfig]]): The receiver agent configuration or list of configurations.
    """

    def __init__(self, sender: AgentConfig,
                 receiver: Union[AgentConfig, List[AgentConfig]]) -> None:
        """
        Constructs a Flow object with the given sender and receiver configurations.

        Args:
            sender (AgentConfig): The sender agent configuration.
            receiver (Union[AgentConfig, List[AgentConfig]]): The receiver agent configuration or list of configurations.
        """
        self.sender = self.load_agent(sender)
        self.receiver = self.load_agent(receiver)

    def load_agent(
            self, agent_spec: AgentFlowSpec) -> Union[autogen.AssistantAgent, autogen.UserProxyAgent]:
        """
        Loads the appropriate agent instance based on the given agent specification.

        Args:
            agent_spec (AgentFlowSpec): The specification of the agent to be loaded.

        Returns:
            Union[autogen.AssistantAgent, autogen.UserProxyAgent]: The appropriate instance of the agent based on the agent type.
        """
        if agent_spec.type == "assistant":
            agent = autogen.AssistantAgent(**asdict(agent_spec.config))
        if agent_spec.type == "userproxy":
            agent = autogen.UserProxyAgent(**asdict(agent_spec.config))

        return agent

    def run(self, message: str) -> None:
        """
        Initiates the chat flow by sending the given message from the sender to the receiver(s).

        Args:
            message (str): The message to be sent.
        """
        self.sender.initiate_chat(self.receiver,
                                  message=message
                                  )
