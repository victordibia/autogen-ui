export interface INodeData {
  label: string;
  children?: any;
}

export interface IMessage {
  userId: string;
  rootMsgId: number;
  msgId?: number;
  role: string;
  content: string;
  timestamp: string;
  personalize?: boolean;
  use_cache?: boolean;
  ra?: string;
}

export interface IStatus {
  message: string;
  status: boolean;
  data?: any;
}

export interface IChatMessage {
  text: string;
  sender: "user" | "bot";
  metadata?: any;
  msgId?: number;
}

export interface ChatInputProps {
  onSubmit: (text: string) => void;
  loading: boolean;
  error: IStatus | null;
}
export interface LogEvent {
  timestamp: string;
  type: string;
  content: string;
  source?: string;
}

export interface IChatMessageWithSession extends IChatMessage {
  sessionId?: string;
  status?: "processing" | "complete";
  finalResponse?: string;
}

export interface MessageListProps {
  messages: IChatMessageWithSession[];
  sessionLogs: Record<string, LogEvent[]>;
  onRetry: (text: string) => void;
  loading: boolean;
}
