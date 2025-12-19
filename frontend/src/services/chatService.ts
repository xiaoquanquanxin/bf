type ResultType = {
  conversationId: string
  message: {
    aiMessage: string,
    drawnObjects: Array<any>
  }
}

// 聊天服务类
class ChatService {
  // API 基础地址
  private baseUrl = 'http://localhost:8000/api';

  // 发送消息方法
  async sendMessage(message: string, userId: string, conversationId: string): Promise<ResultType> {
    // 发送 HTTP 请求
    const response = await fetch(`${this.baseUrl}/chat`, {
      // 请求方法
      method: 'POST',
      // 请求头
      headers: {
        'Content-Type': 'application/json',
      },
      // 请求体
      body: JSON.stringify({
        message,
        userId,
        conversationId
      }),
    });

    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 返回 JSON 响应
    return response.json();
  }
}

// 导出聊天服务实例
export const chatService = new ChatService();
