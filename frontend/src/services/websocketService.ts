// 全局WebSocket连接状态
let globalWS: WebSocket | null = null;
let isConnecting = false;

class WebSocketService {
  private listeners: Map<string, Function[]> = new Map();
  private baseUrl: string = 'ws://localhost:8888';
  private userId: string = '';
  private conversationId: string = '';

  /**
   * 初始化会话信息
   */
  initialize(userId?: string, conversationId?: string) {
    // 如果没有提供 userId,先从 sessionStorage（tab独立）,再从 localStorage,最后生成新的
    if (!userId) {
      userId = sessionStorage.getItem('userId') ||
               localStorage.getItem('userId') ||
               this.generateUserId();
    }

    // conversationId 使用 sessionStorage（每个 tab 独立）
    if (!conversationId) {
      conversationId = sessionStorage.getItem('currentConversationId') ||
                      this.generateConversationId();
    }

    this.userId = userId;
    this.conversationId = conversationId;

    // userId 存到 localStorage（跨 tab 共享,代表同一用户）
    localStorage.setItem('userId', this.userId);

    // conversationId 存到 sessionStorage（每个 tab 独立,代表不同项目）
    sessionStorage.setItem('currentConversationId', this.conversationId);
  }

  /**
   * 生成用户 ID
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成会话 ID
   */
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取当前会话信息
   */
  getSessionInfo() {
    return {
      userId: this.userId,
      conversationId: this.conversationId
    };
  }

  /**
   * 连接 WebSocket（携带会话信息）
   */
  connect(userId?: string, conversationId?: string): Promise<void> {
    // 初始化会话信息
    this.initialize(userId, conversationId);

    if (globalWS?.readyState === WebSocket.OPEN || isConnecting) {
      return Promise.resolve();
    }

    isConnecting = true;
    return new Promise((resolve, reject) => {
      // 构建带参数的 WebSocket URL
      const wsUrl = `${this.baseUrl}?userId=${this.userId}&conversationId=${this.conversationId}`;
      globalWS = new WebSocket(wsUrl);

      globalWS.onopen = () => {
        isConnecting = false;
        resolve();
      };

      globalWS.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.emit(data.type, data);
      };

      globalWS.onerror = (error) => {
        isConnecting = false;
        console.error('❌ WebSocket 错误:', error);
        reject(error);
      };

      globalWS.onclose = (event) => {
        globalWS = null;
      };
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (globalWS) {
      globalWS.close();
      globalWS = null;
    }
  }
}

export const wsService = new WebSocketService();
