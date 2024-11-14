"use client";

import * as React from "react";
import { message } from "antd";
import { IChatMessageWithSession, IStatus, LogEvent } from "../types";
import MessageList from "./messagelist";
import ChatInput from "./chatinput";

interface ChatViewProps {
  initMessages: any[];
  viewHeight?: string;
}

// Default server URL if not provided in environment
const DEFAULT_SERVER_URL = "http://localhost:3000";

export default function ChatView({
  initMessages,
  viewHeight = "100%",
}: ChatViewProps) {
  const serverUrl = process.env.NEXT_PUBLIC_API_SERVER || DEFAULT_SERVER_URL;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<IStatus | null>({
    status: true,
    message: "All good",
  });
  const [messages, setMessages] = React.useState<IChatMessageWithSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(
    null
  );
  const [sessionLogs, setSessionLogs] = React.useState<
    Record<string, LogEvent[]>
  >({});
  const [activeSockets, setActiveSockets] = React.useState<
    Record<string, WebSocket>
  >({});

  const getBaseUrl = (url: string): string => {
    try {
      // Remove protocol and api path for WebSocket
      return url
        .replace(/(^\w+:|^)\/\//, "") // Remove protocol (http:// or https://)
        .replace("/api", ""); // Remove /api for base
    } catch (error) {
      console.error("Error processing server URL:", error);
      throw new Error("Invalid server URL configuration");
    }
  };

  const getApiBaseUrl = (url: string): string => {
    // Keep the /api path for HTTP requests
    return url.replace(/\/$/, ""); // Just remove trailing slash if exists
  };

  React.useEffect(() => {
    setMessages(initMessages);
  }, [initMessages]);

  // Cleanup WebSocket connections
  React.useEffect(() => {
    return () => {
      Object.values(activeSockets).forEach((socket) => socket.close());
    };
  }, [activeSockets]);

  const connectWebSocket = async (sessionId: string): Promise<WebSocket> => {
    const baseUrl = getBaseUrl(serverUrl);
    const wsUrl = `ws://${baseUrl}/api/ws/logs/${sessionId}`;

    return new Promise((resolve, reject) => {
      const socket = new WebSocket(wsUrl);

      let heartbeatInterval: NodeJS.Timeout;

      socket.onopen = () => {
        console.log("WebSocket connected for session:", sessionId);

        // Setup heartbeat every 30 seconds
        heartbeatInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send("ping");
          }
        }, 30000);

        setActiveSockets((prev) => ({
          ...prev,
          [sessionId]: socket,
        }));
        resolve(socket);
      };

      socket.onmessage = (event) => {
        try {
          const logEvent = JSON.parse(event.data);
          console.log("Received event:", logEvent);

          setSessionLogs((prev) => ({
            ...prev,
            [sessionId]: [...(prev[sessionId] || []), logEvent],
          }));

          if (logEvent.type === "GroupChatPublishEvent") {
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.sessionId === sessionId && msg.sender === "bot") {
                  return {
                    ...msg,
                    text: logEvent.content,
                  };
                }
                return msg;
              })
            );
          }

          if (logEvent.type === "TaskResultEvent") {
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.sessionId === sessionId && msg.sender === "bot") {
                  return {
                    ...msg,
                    finalResponse: logEvent.content,
                  };
                }
                return msg;
              })
            );
          }

          if (logEvent.type === "ErrorEvent") {
            message.error(logEvent.content);
            setError({
              status: false,
              message: logEvent.content,
            });
          }

          if (logEvent.type === "TerminationEvent") {
            console.log("Stream completed for session:", sessionId);
            clearInterval(heartbeatInterval);
            socket.close();
            setActiveSockets((prev) => {
              const newSockets = { ...prev };
              delete newSockets[sessionId];
              return newSockets;
            });
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        clearInterval(heartbeatInterval);
        message.error("WebSocket connection error");
        reject(error);
      };

      socket.onclose = () => {
        console.log("WebSocket closed for session:", sessionId);
        clearInterval(heartbeatInterval);
        setActiveSockets((prev) => {
          const newSockets = { ...prev };
          delete newSockets[sessionId];
          return newSockets;
        });
      };
    });
  };

  const createSession = async (): Promise<string> => {
    const apiUrl = getApiBaseUrl(serverUrl);
    const response = await fetch(`${apiUrl}/create_session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to create session");
    }

    const data = await response.json();
    return data.session_id;
  };

  const chatHistory = (messages: IChatMessageWithSession[]) => {
    let history = "";
    messages.forEach((message) => {
      history += `${message.sender}: ${message.text}\n`;
    });
    return history;
  };

  const getCompletion = async (query: string) => {
    setError(null);
    setLoading(true);

    let currentSessionId: string | null = null;
    try {
      currentSessionId = await createSession();
      setCurrentSessionId(currentSessionId);

      // Wait for WebSocket to connect
      const socket = await connectWebSocket(currentSessionId);

      if (!socket) {
        throw new Error("Could not establish WebSocket connection");
      }

      const userMessage: IChatMessageWithSession = {
        text: query,
        sender: "user",
        sessionId: currentSessionId,
      };

      const botMessage: IChatMessageWithSession = {
        text: "",
        sender: "bot",
        sessionId: currentSessionId,
        status: "processing",
      };

      setMessages((prev) => [...prev, userMessage, botMessage]);

      const apiUrl = getApiBaseUrl(serverUrl);
      const response = await fetch(`${apiUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: query,
          history: chatHistory(messages),
          session_id: currentSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Generate request failed");
      }

      const data = await response.json();
      if (!data.status) {
        throw new Error(data.message || "Unknown error occurred");
      }
    } catch (err) {
      console.error("Error:", err);
      message.error(
        err instanceof Error ? err.message : "Unknown error occurred"
      );

      if (currentSessionId && activeSockets[currentSessionId]) {
        activeSockets[currentSessionId].close();
      }

      setError({
        status: false,
        message: err instanceof Error ? err.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ height: "calc(100% - 20px)" }}
      className="text-primary overflow-auto bg-primary relative scroll rounded flex-1"
    >
      <MessageList
        messages={messages}
        sessionLogs={sessionLogs}
        onRetry={getCompletion}
        loading={loading}
      />

      <ChatInput onSubmit={getCompletion} loading={loading} error={error} />
    </div>
  );
}
