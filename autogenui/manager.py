# a manager class that can
# load an autogen flow run an autogen flow and return the response to the client


from typing import Dict
import autogen


class Manager(object):
    def __init__(self) -> None:

        pass

    def run_flow(self, prompt: str, flow: str = "default") -> None:
        config_list = autogen.config_list_openai_aoai()

        llm_config = {
            "seed": 42,  # seed for caching and reproducibility
            "config_list": config_list,  # a list of OpenAI API configurations
            "temperature": 0,  # temperature for sampling
            "use_cache": True,  # whether to use cache
        }

        assistant = autogen.AssistantAgent(
            name="assistant",
            llm_config=llm_config,
        )

        # create a UserProxyAgent instance named "user_proxy"
        user_proxy = autogen.UserProxyAgent(
            name="user_proxy",
            human_input_mode="NEVER",
            llm_config=llm_config,
            max_consecutive_auto_reply=10,
            is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
            code_execution_config={
                "work_dir": "scratch/coding",
                "use_docker": False
            },
        )
        user_proxy.initiate_chat(
            assistant,
            message=prompt,
        )

        messages = user_proxy.chat_messages[assistant]
        return messages
