

from typing import Dict


def parse_token_usage(logged_history: Dict):
    all_usage = []
    all_cost = 0
    all_tokens = 0
    for key in logged_history.keys():
        curr_usage = logged_history[key]["response"]
        all_cost += curr_usage["cost"]
        all_tokens += curr_usage["usage"]["total_tokens"]
        all_usage.append(curr_usage)
    usage = {
        "total_cost": all_cost,
        "total_tokens": all_tokens,
        "usage": all_usage
    }

    return usage
