export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  drawnObjects: any;
  timestamp: Date;
}

export interface FrontendAction {
  method: string;
  params: Record<string, any>;
}

export interface StreamEvent {
  type: 'message' | 'tool' | 'end' | 'error';
  data: any;
}

export type StreamCallback = (event: StreamEvent) => void;
