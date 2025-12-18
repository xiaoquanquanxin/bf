export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface FrontendAction {
  method: string;
  params: Record<string, any>;
}

export interface ChatResponse {
  mainMessage: string;
  frontend_actions?: FrontendAction[];
}

export interface StreamEvent {
  type: 'start' | 'end' | 'error';
  message_id?: string;
  conversation_id?: string;
  timestamp?: string;
  error?: string;
}

export interface ChatRequest {
  message: string;
  userId: string;
  conversationId?: string;
  stream: boolean;
  extraInfo?: any;
}