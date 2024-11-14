from typing import AsyncGenerator, Union, Optional
import time
import json
from pathlib import Path
from .datamodel import TeamResult, TaskResult, TeamConfig
from autogen_agentchat.messages import AgentMessage, ChatMessage
from autogen_core.base import CancellationToken
from .provider import Provider
from .datamodel import TeamConfig


class TeamManager:
    def __init__(self) -> None:
        self.provider = Provider()

    async def load_team_config(self, config_path: Union[str, Path]) -> TeamConfig:
        """Load team configuration from JSON file"""
        if isinstance(config_path, str):
            config_path = Path(config_path)

        if not config_path.exists():
            raise FileNotFoundError(
                f"Team configuration file not found: {config_path}")

        with config_path.open() as f:
            team_json_spec = json.load(f)

        # Convert JSON spec to TeamConfig format
        if isinstance(team_json_spec, dict):
            try:
                return TeamConfig(**team_json_spec)
            except Exception as e:
                raise ValueError(f"Invalid team configuration: {str(e)}")
        raise ValueError("Team configuration must be a JSON object")

    async def run_stream(
        self,
        task: str,
        team_config: Optional[Union[TeamConfig, str, Path]] = None,
        cancellation_token: Optional[CancellationToken] = None
    ) -> AsyncGenerator[Union[AgentMessage, ChatMessage, TaskResult], None]:
        """Stream the team's execution results with optional JSON config loading"""
        start_time = time.time()

        try:
            if isinstance(team_config, (str, Path)):
                team_config = await self.load_team_config(team_config)
            elif team_config is None:
                # Load default team config if none provided
                team_config = await self.load_team_config("notebooks/default_team.json")

            # Use provider to create team from config
            team = self.provider.load_team(team_config)

            # Check if team supports streaming
            if not hasattr(team, 'run_stream'):
                raise NotImplementedError("Team does not support streaming")

            stream = team.run_stream(
                task=task,
                cancellation_token=cancellation_token
            )

            async for message in stream:
                if cancellation_token and cancellation_token.is_cancelled():
                    break

                if isinstance(message, TaskResult):
                    yield TeamResult(
                        task_result=message,
                        usage="",  # TODO: Implement token usage parsing
                        duration=time.time() - start_time
                    )
                else:
                    yield message

        except Exception as e:
            raise e

    async def run(
        self,
        task: str,
        team_config: Optional[Union[TeamConfig, str, Path]] = None,
        cancellation_token: Optional[CancellationToken] = None
    ) -> TeamResult:
        """Non-streaming run method with optional JSON config loading"""
        start_time = time.time()

        try:
            if isinstance(team_config, (str, Path)):
                team_config = await self.load_team_config(team_config)
            elif team_config is None:
                # Load default team config if none provided
                team_config = await self.load_team_config("notebooks/default_team.json")

            # Use provider to create team from config
            team = self.provider.load_team(team_config)

            result = await team.run(
                task=task,
                cancellation_token=cancellation_token
            )

            return TeamResult(
                task_result=result,
                usage="",  # TODO: Implement token usage parsing
                duration=time.time() - start_time
            )

        except Exception as e:
            raise e
