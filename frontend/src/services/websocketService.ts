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
    // 如果没有提供 userId，从 localStorage 获取或生成新的
    this.userId = userId || localStorage.getItem('userId') || this.generateUserId();

    // 如果没有提供 conversationId，从 localStorage 获取或生成新的
    this.conversationId = conversationId || localStorage.getItem('currentConversationId') || this.generateConversationId();

    // 保存到 localStorage
    localStorage.setItem('userId', this.userId);
    localStorage.setItem('currentConversationId', this.conversationId);

    console.log('🔧 WebSocket 会话初始化:', {
      userId: this.userId,
      conversationId: this.conversationId
    });
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
      console.log('🔌 连接 WebSocket:', wsUrl);

      globalWS = new WebSocket(wsUrl);

      globalWS.onopen = () => {
        isConnecting = false;
        console.log('✅ WebSocket 连接成功');
        resolve();
      };

      globalWS.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📨 收到消息:', data);
        this.emit(data.type, data);
      };

      globalWS.onerror = (error) => {
        isConnecting = false;
        console.error('❌ WebSocket 错误:', error);
        reject(error);
      };

      globalWS.onclose = (event) => {
        console.log('🔌 WebSocket 断开:', event.code, event.reason);
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