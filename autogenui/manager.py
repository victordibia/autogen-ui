# a manager class that can
# load an autogen flow run an autogen flow and return the response to the client


from typing import Dict
import autogen
from .utils import parse_token_usage
import time
import json
from .provider import Provider


class Manager(object):
    def __init__(self, ) -> None:
        self.provider = Provider()

    async def run(self, task: str) -> None:

        team_json_spec = json.load(open("notebooks/default_team.json"))

        team = self.provider.load_team(team_json_spec)
        start_time = time.time()
        result = await team.run(task=task)
        response = {
            "messages": result.messages,
            "usage": "",  # parse_token_usage(logged_history),
            "duration": time.time() - start_time,
        }
        return response
