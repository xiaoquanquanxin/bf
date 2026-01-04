import { WebSocket } from 'ws'

class WebSocketManager {
  private clients: Set<WebSocket> = new Set()

  addClient(ws: WebSocket) {
    this.clients.add(ws)
    console.log(`➕ 新客户端连接，当前总数: ${this.clients.size}`)

    ws.on('close', () => {
      this.clients.delete(ws)
      console.log(`➖ 客户端断开，当前总数: ${this.clients.size}`)
    })

    ws.on('error', (error) => {
      console.error('❌ 客户端 WebSocket 错误:', error)
      this.clients.delete(ws)
    })
  }

  broadcast(data: any) {
    const message = JSON.stringify(data)
    let successCount = 0
    let failCount = 0

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message)
          successCount++
        } catch (error) {
          console.error('❌ 发送消息失败:', error)
          failCount++
          this.clients.delete(client)
        }
      } else {
        // 清理已关闭的连接
        this.clients.delete(client)
        failCount++
      }
    })

    console.log(`📤 广播消息: 成功 ${successCount} 个，失败 ${failCount} 个`)
  }

  getClientCount() {
    return this.clients.size
  }

  // 获取活跃连接数
  getActiveClientCount() {
    let activeCount = 0
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        activeCount++
      }
    })
    return activeCount
  }
}


export const wsManager = new WebSocketManager()


