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
  sender: 'user' | 'bot';
  metadata?: any;
  msgId?: number;
}
