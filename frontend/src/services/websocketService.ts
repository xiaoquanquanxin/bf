// 全局WebSocket连接状态
let globalWS: WebSocket | null = null;
let isConnecting = false;

class WebSocketService {
  private listeners: Map<string, Function[]> = new Map();
  private url: string = 'ws://localhost:8888';

  connect(): Promise<void> {
    if (globalWS?.readyState === WebSocket.OPEN || isConnecting) {
      return Promise.resolve();
    }

    isConnecting = true;
    return new Promise((resolve, reject) => {
      globalWS = new WebSocket(this.url);
      
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
        reject(error);
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