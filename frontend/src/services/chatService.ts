import { ChatRequest, ChatResponse, StreamEvent } from '../types';

class ChatService {
  private baseUrl = 'http://localhost:8000/api/chat';

  async sendMessage(
    message: string,
    userId: string,
    conversationId?: string,
    onMessage?: (response: ChatResponse) => void,
    onEvent?: (event: StreamEvent) => void
  ): Promise<string> {
    const request: ChatRequest = {
      message,
      userId,
      conversationId,
      stream: true
    };

    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流');
    }

    let conversationIdResult = conversationId || '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type) {
                // 处理流事件
                if (data.type === 'start' && data.conversation_id) {
                  conversationIdResult = data.conversation_id;
                }
                onEvent?.(data as StreamEvent);
              } else if (data.mainMessage) {
                // 处理聊天响应
                onMessage?.(data as ChatResponse);
              }
            } catch (e) {
              console.warn('解析 SSE 数据失败:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return conversationIdResult;
  }
}

export const chatService = new ChatService();