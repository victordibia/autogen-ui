from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional, List, Union
import logging
import os
import uuid
import datetime
import traceback
import asyncio
from pathlib import Path

# Import your team manager components
from autogen_agentchat import EVENT_LOGGER_NAME
from autogen_agentchat.messages import AgentMessage, ChatMessage, ToolCallMessage, ToolCallResultMessage
from autogen_core.base import CancellationToken
from ..manager import TeamManager
from ..datamodel import TeamResult, TaskResult

# Request models


class GenerateWebRequest(BaseModel):
    prompt: str
    history: Optional[str] = ""
    session_id: str


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_ready: Dict[str, bool] = {}

    async def create_session(self) -> str:
        """Create a new session ID"""
        return str(uuid.uuid4())

    async def connect(self, session_id: str, websocket: WebSocket):
        """Connect a WebSocket with its session ID"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.connection_ready[session_id] = True
        logging.info(f"WebSocket connected for session: {session_id}")

    async def disconnect(self, session_id: str):
        """Remove a WebSocket connection"""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            self.connection_ready[session_id] = False
            logging.info(f"WebSocket disconnected for session: {session_id}")

    def get_connection(self, session_id: str) -> Optional[WebSocket]:
        """Get WebSocket connection by session ID"""
        if session_id in self.active_connections and self.connection_ready.get(session_id):
            return self.active_connections[session_id]
        return None

    async def session_exists(self, session_id: str) -> bool:
        """Check if a session exists and is ready"""
        return session_id in self.active_connections and self.connection_ready.get(session_id, False)


# Initialize FastAPI
app = FastAPI()

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API router
api = FastAPI(root_path="/api")

# Initialize managers
connection_manager = ConnectionManager()
team_manager = TeamManager()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(EVENT_LOGGER_NAME)
logger.setLevel(logging.INFO)


@api.post("/create_session")
async def create_session() -> Dict:
    """Create a new session for the chat interaction"""
    session_id = await connection_manager.create_session()
    logger.info(f"Created new session: {session_id}")
    return {"session_id": session_id}


@api.websocket("/ws/logs/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """Handle WebSocket connections for streaming"""
    await connection_manager.connect(session_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        await connection_manager.disconnect(session_id)
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {str(e)}")
        await connection_manager.disconnect(session_id)


@api.post("/generate")
async def generate(req: GenerateWebRequest):
    """Generate a streaming response using TeamManager"""
    logger.info(f"Generate request received for session: {req.session_id}")

    if not req.session_id:
        return {"status": False, "message": "Missing session_id"}

    # Add retry logic for websocket connection
    retries = 3
    websocket = None

    while retries > 0 and not websocket:
        websocket = connection_manager.get_connection(req.session_id)
        if not websocket:
            await asyncio.sleep(0.5)  # Wait a bit between retries
            retries -= 1
            logger.info(
                f"Retrying WebSocket connection, attempts left: {retries}")

    if not websocket:
        logger.error(
            f"WebSocket connection not found for session: {req.session_id}")
        return {
            "status": False,
            "message": "WebSocket connection not found or not ready"
        }

    try:
        # Start streaming response
        async for message in team_manager.run_stream(
            task=req.prompt,
            cancellation_token=None
        ):
            try:
                if isinstance(message, (AgentMessage, ChatMessage)):
                    content = message.content if hasattr(
                        message, 'content') else str(message)
                    if isinstance(message, ToolCallMessage) or isinstance(message, ToolCallResultMessage):
                        content = "".join([str(tool_call)
                                           for tool_call in message.content])
                    await websocket.send_json({
                        "type": "message",
                        "content": content,
                        "source": message.sender if hasattr(message, 'sender') else "system",
                        "timestamp": str(datetime.datetime.now())
                    })
                elif isinstance(message, TeamResult):
                    await websocket.send_json({
                        "type": "result",
                        "content": str(message.task_result.messages[-1].content) if hasattr(message.task_result, 'messages') else str(message),
                        "source": "task_result",
                        "timestamp": str(datetime.datetime.now())
                    })
            except Exception as e:
                logger.error(
                    f"Error sending message for session {req.session_id}: {str(e)}")
                raise

        # Send completion event
        await websocket.send_json({
            "type": "TerminationEvent",
            "content": "Stream completed",
            "timestamp": str(datetime.datetime.now())
        })

        return {
            "status": True,
            "data": {
                "messages": []  # Your frontend expects this
            },
            "session_id": req.session_id
        }

    except Exception as e:
        logger.error(f"Error in generate stream: {str(e)}")
        traceback.print_exc()

        try:
            # Send error event through WebSocket
            await websocket.send_json({
                "type": "ErrorEvent",
                "content": str(e),
                "timestamp": str(datetime.datetime.now())
            })
        except:
            logger.error("Failed to send error event through WebSocket")

        return {
            "status": False,
            "message": str(e),
            "session_id": req.session_id
        }

# Mount the API router
app.mount("/api", api)


@app.get("/")
async def root():
    return {"message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
