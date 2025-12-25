import {StreamCallback, StreamEvent} from '../types';

// 聊天服务类
class ChatService {
  // API 基础地址
  private baseUrl = 'http://localhost:8888/api';

  // 流式发送消息方法
  sendMessageStream(
    message: string,
    userId: string,
    conversationId: string,
    onEvent: StreamCallback
  ): () => void {
    let abortController = new AbortController();

    fetch(`${this.baseUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId,
        conversationId
      }),
      signal: abortController.signal
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is null');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      const readStream = async () => {
        try {
          while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, {stream: true});
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  return;
                }
                try {
                  const event: StreamEvent = JSON.parse(data);
                  onEvent(event);
                } catch (e) {
                  console.error('解析流数据失败:', e);
                }
              }
            }
          }
        } catch (error) {
          if ((error as any).name !== 'AbortError') {
            onEvent({type: 'error', data: {message: '流读取错误'}});
          }
        }
      };

      readStream();
    }).catch(error => {
      if (error.name !== 'AbortError') {
        onEvent({type: 'error', data: {message: error.message}});
      }
    });

    // 返回取消函数
    return () => {
      abortController.abort();
    };
  }
}

// 导出聊天服务实例
export const chatService = new ChatService();
