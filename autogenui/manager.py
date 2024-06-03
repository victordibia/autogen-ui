# a manager class that can
# load an autogen flow run an autogen flow and return the response to the client


from typing import Dict
import autogen
from .utils import parse_token_usage
import time


class Manager(object):
    def __init__(self) -> None:

        pass

    def run_flow(self, prompt: str, flow: str = "default") -> None:
        #autogen.ChatCompletion.start_logging(compact=False)
        config_list = autogen.config_list_openai_aoai()

        llm_config = {
            "seed": 42,  # seed for caching and reproducibility
            "config_list": config_list,  # a list of OpenAI API configurations
            "temperature": 0,  # temperature for sampling
            "model": "gpt-4o",
        }

        assistant = autogen.AssistantAgent(
            name="assistant",
            max_consecutive_auto_reply=3, llm_config=llm_config,)

        # create a UserProxyAgent instance named "user_proxy"
        user_proxy = autogen.UserProxyAgent(
            name="user_proxy",
            human_input_mode="NEVER",
            llm_config=llm_config,
            max_consecutive_auto_reply=3,
            is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
            code_execution_config={
                "work_dir": "scratch/coding",
                "use_docker": False
            },
        )
        start_time = time.time()
        user_proxy.initiate_chat(
            assistant,
            message=prompt,

        )

        messages = user_proxy.chat_messages[assistant]
        #logged_history = autogen.ChatCompletion.logged_history
        autogen.ChatCompletion.stop_logging()
        response = {
            "messages": messages[1:],
            "usage": "", #parse_token_usage(logged_history),
            "duration": time.time() - start_time,
        }
        return response
