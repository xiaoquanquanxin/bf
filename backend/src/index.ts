// 导入环境变量配置
import 'dotenv/config'
// 导入 Express 框架
import express from 'express'
// 导入聊天路由器
import { chatRouter } from './routers/chatRouter'
// 导入 WebSocket
import { createServer } from 'http'
import { closeMCP } from './mcp-server'
import { wsManager } from './utils/websocket'
import { WebSocketServer } from 'ws'
import { myMCPdemo } from './agents/math'


// 创建 Express 应用
const app = express()
// 设置端口号
const PORT = process.env.PORT

// JSON 中间件
app.use(express.json())

// CORS 中间件
app.use((req, res, next) => {
  // 允许所有来源
  res.header('Access-Control-Allow-Origin', '*')
  // 允许的 HTTP 方法
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  // 允许的请求头
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// 注册聊天路由
app.use('/api', chatRouter)


// 创建 HTTP 服务器
const server = createServer(app)

// 创建 WebSocket 服务器
const wss = new WebSocketServer({
  server,
  // 添加 CORS 支持
  verifyClient: (info: any) => {
    // 允许所有来源的 WebSocket 连接
    return true
  },
})

wss.on('connection', (ws: any, req: any) => {
  const clientIP = req.socket.remoteAddress
  console.log(`🔌 WebSocket 客户端连接 - IP: ${clientIP}`)
  wsManager.addClient(ws)

  // 发送连接确认消息
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'WebSocket 连接成功',
    timestamp: Date.now(),
  }))

  ws.on('message', (message: any) => {
    console.log('📨 收到消息:', message.toString())
  })

  ws.on('close', (code: any, reason: any) => {
    console.log(`❌ WebSocket 客户端断开 - Code: ${code}, Reason: ${reason}`)
  })

  ws.on('error', (error: any) => {
    console.error('❌ WebSocket 错误:', error)
  })
})


// const mcpServer = new Server(
//   {
//     name: 'math-server',
//     version: '0.1.0',
//   },
//   {
//     capabilities: {
//       tools: {},
//     },
//   },
// )
// app.post('/mcp', async (req, res) => {
//   const transport = new SSEServerTransport('/mcp', res)
//   await mcpServer.connect(transport)
// })

// app.listen(PORT, () => {
//   console.log(myMCPdemo)
//   console.log(`Weather MCP server running on port ${PORT}`)
// })


// 启动服务器
server.listen(PORT, async () => {
  // 输出服务器启动信息
  console.log(`✅ 服务器启动: http://localhost:${PORT}`)
  // 输出 API 接口信息
  console.log(`📡 聊天接口: http://localhost:${PORT}/api/chat`)
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`)
  console.log(`📊 当前连接的客户端数量: ${wsManager.getClientCount()}`)
}).on('error', (err: any) => {
  console.error('服务器启动失败:', err)
})


// 服务器关闭时
process.on('SIGTERM', async () => {
  console.log('Shutting down...')
  server.close()
  await closeMCP()  // ✅ 程序完全退出前关闭
  console.log('✅ Clean shutdown')
})

myMCPdemo()
