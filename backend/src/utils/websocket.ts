import { WebSocket } from 'ws'

/**
 * 客户端信息
 */
interface ClientInfo {
  ws: WebSocket;
  userId: string;
  conversationId: string;
  sessionId: string;  // "modeling_userId_conversationId"
  connectedAt: number;
}

/**
 * WebSocket 管理器（支持会话隔离）
 */
class WebSocketManager {
  // 按会话组织连接：sessionId -> Set<ClientInfo>
  private sessions: Map<string, Set<ClientInfo>> = new Map();

  // 快速查找：WebSocket -> ClientInfo
  private wsToClient: Map<WebSocket, ClientInfo> = new Map();

  /**
   * 生成 sessionId
   */
  private getSessionId(userId: string, conversationId: string): string {
    return `modeling_${userId}_${conversationId}`;
  }

  /**
   * 添加客户端（带会话信息）
   */
  addClient(ws: WebSocket, userId: string, conversationId: string) {
    const sessionId = this.getSessionId(userId, conversationId);

    const clientInfo: ClientInfo = {
      ws,
      userId,
      conversationId,
      sessionId,
      connectedAt: Date.now(),
    };

    // 添加到会话组
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new Set());
    }
    this.sessions.get(sessionId)!.add(clientInfo);

    // 添加到快速查找表
    this.wsToClient.set(ws, clientInfo);

    console.log(`➕ 客户端连接 [${sessionId}] (会话客户端: ${this.sessions.get(sessionId)!.size}, 总计: ${this.wsToClient.size})`);

    // 监听断开
    ws.on('close', () => {
      this.removeClient(ws);
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket 错误:', error);
      this.removeClient(ws);
    });
  }

  /**
   * 移除客户端
   */
  private removeClient(ws: WebSocket) {
    const clientInfo = this.wsToClient.get(ws);
    if (!clientInfo) return;

    const { sessionId } = clientInfo;

    // 从会话组中移除
    const sessionClients = this.sessions.get(sessionId);
    if (sessionClients) {
      sessionClients.delete(clientInfo);

      // 如果会话没有客户端了，删除会话
      if (sessionClients.size === 0) {
        this.sessions.delete(sessionId);
      }
    }

    // 从快速查找表中移除
    this.wsToClient.delete(ws);

    console.log(`➖ 客户端断开 [${sessionId}] (剩余: ${sessionClients?.size || 0})`);
  }

  /**
   * 广播给指定会话的所有客户端
   */
  broadcastToSession(userId: string, conversationId: string, data: any) {
    const sessionId = this.getSessionId(userId, conversationId);
    const sessionClients = this.sessions.get(sessionId);

    if (!sessionClients || sessionClients.size === 0) {
      return;
    }

    const message = JSON.stringify(data);
    let successCount = 0;

    sessionClients.forEach(clientInfo => {
      if (clientInfo.ws.readyState === WebSocket.OPEN) {
        try {
          clientInfo.ws.send(message);
          successCount++;
        } catch (error) {
          console.error('❌ 发送失败:', error);
          this.removeClient(clientInfo.ws);
        }
      } else {
        this.removeClient(clientInfo.ws);
      }
    });
  }

  /**
   * 广播给所有客户端（保留此方法用于全局通知）
   */
  broadcast(data: any) {
    const message = JSON.stringify(data);

    this.wsToClient.forEach((clientInfo, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
        } catch (error) {
          console.error('❌ 广播失败:', error);
          this.removeClient(ws);
        }
      } else {
        this.removeClient(ws);
      }
    });
  }

  /**
   * 获取总客户端数
   */
  getClientCount() {
    return this.wsToClient.size;
  }

  /**
   * 获取指定会话的客户端数
   */
  getSessionClientCount(userId: string, conversationId: string) {
    const sessionId = this.getSessionId(userId, conversationId);
    return this.sessions.get(sessionId)?.size || 0;
  }

  /**
   * 获取活跃连接数
   */
  getActiveClientCount() {
    let activeCount = 0;
    this.wsToClient.forEach((clientInfo, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        activeCount++;
      }
    });
    return activeCount;
  }

  /**
   * 获取所有会话列表
   */
  getSessions() {
    const sessions: Array<{ sessionId: string; clientCount: number }> = [];
    this.sessions.forEach((clients, sessionId) => {
      sessions.push({
        sessionId,
        clientCount: clients.size,
      });
    });
    return sessions;
  }
}


export const wsManager = new WebSocketManager()



