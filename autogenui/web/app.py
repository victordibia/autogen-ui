from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from typing import Dict
from ..datamodel import GenerateWebRequest
from .connectionmanager import ConnectionManager
from ..logging.handler import ConsoleLogHandler, WebSocketLogHandler
from ..manager import Manager
import traceback
from autogen_agentchat import EVENT_LOGGER_NAME
from pydantic import BaseModel
import contextvars
import asyncio

# Create a context variable to store the session ID
session_context = contextvars.ContextVar('session_id', default=None)

# Initialize FastAPI
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000",
                   "http://localhost:8001",
                   "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API router
api = FastAPI(root_path="/api")

# Set up static file serving
root_file_path = os.path.dirname(os.path.abspath(__file__))
files_static_root = os.path.join(root_file_path, "files/")
static_folder_root = os.path.join(root_file_path, "ui")

os.makedirs(files_static_root, exist_ok=True)
api.mount("/files", StaticFiles(directory=files_static_root,
                                html=True), name="files")

# Set up WebSocket connection manager
connection_manager = ConnectionManager()

# Modify WebSocketLogHandler to use context vars


class ModifiedWebSocketLogHandler(WebSocketLogHandler):
    def get_current_session(self) -> str:
        return session_context.get()


# Configure logging
logger = logging.getLogger(EVENT_LOGGER_NAME)
console_handler = ConsoleLogHandler()
websocket_handler = ModifiedWebSocketLogHandler(connection_manager)
logger.handlers = [console_handler, websocket_handler]
logger.setLevel(logging.INFO)

# Create manager instance
manager = Manager()


@api.post("/create_session")
async def create_session() -> Dict:
    """Create a new session for the chat interaction"""
    session_id = await connection_manager.create_session()
    return {"session_id": session_id}


@api.websocket("/ws/logs/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """Handle WebSocket connections for log streaming"""
    await connection_manager.connect(session_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await connection_manager.disconnect(session_id)


@api.post("/generate")
async def generate(req: GenerateWebRequest) -> Dict:
    """Generate a response from the autogen flow"""
    if not hasattr(req, 'session_id') or not req.session_id:
        return {
            "status": False,
            "message": "Missing session_id"
        }

    session_id = req.session_id
    if not await connection_manager.session_exists(session_id):
        return {
            "status": False,
            "message": "Invalid session_id"
        }

    # Set the session ID in the context
    token = session_context.set(session_id)
    try:
        prompt = req.prompt
        history = req.history or ""
        prompt = f"{history}\n\n{prompt}"

        try:
            agent_response = await manager.run(task=prompt)
            response = {
                "data": agent_response,
                "status": True,
                "session_id": session_id
            }
        except Exception as e:
            traceback.print_exc()
            response = {
                "data": str(e),
                "status": False,
                "session_id": session_id
            }

        return response
    finally:
        # Reset the context
        session_context.reset(token)

# Mount the API router
app.mount("/api", api)

# Mount static files
app.mount("/", StaticFiles(directory=static_folder_root, html=True), name="ui")
