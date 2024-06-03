import logging
from typing import Dict
from ..datamodel import GenerateWebRequest
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os
from fastapi.middleware.cors import CORSMiddleware
import os

from ..manager import Manager
import traceback

logger = logging.getLogger("autogenui")


app = FastAPI()
# allow cross origin requests for testing on localhost: 800 * ports only
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = FastAPI(root_path="/api")
app.mount("/api", api)


root_file_path = os.path.dirname(os.path.abspath(__file__))
files_static_root = os.path.join(root_file_path, "files/")
static_folder_root = os.path.join(root_file_path, "ui")


os.makedirs(files_static_root, exist_ok=True)
api.mount("/files", StaticFiles(directory=files_static_root, html=True), name="files")


app.mount("/", StaticFiles(directory=static_folder_root, html=True), name="ui")


manager = Manager()


@api.post("/generate")
async def generate(req: GenerateWebRequest) -> Dict:
    """Generate a response from the autogen flow"""
    prompt = req.prompt
    history = req.history or ""

    prompt = f"{history}\n\n{prompt}"
    print("******history******", history)

    try:
        agent_response = manager.run_flow(prompt=prompt)
        response = {
            "data": agent_response,
            "status": True
        }
    except Exception as e:
        traceback.print_exc()
        response = {
            "data": str(e),
            "status": False
        }

    return response


@api.post("/hello")
async def hello() -> None:
    return "hello world"
