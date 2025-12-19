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

