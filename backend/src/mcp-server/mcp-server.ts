import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import express from 'express'

const app = express()
app.use(express.json())

// 创建 MCP 服务器
const server = new Server(
  {
    name: 'math-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
)

// 定义工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'add',
        description: 'Add two numbers',
        inputSchema: {
          type: 'object',
          properties: {
            a: { type: 'number' },
            b: { type: 'number' },
          },
          required: ['a', 'b'],
        },
      },
    ],
  }
})

// 定义工具执行
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case 'add': {
      const { a, b } = request.params.arguments as { a: number; b: number }
      return {
        content: [
          {
            type: 'text',
            text: String(a + b),
          },
        ],
      }
    }
    default:
      throw new Error(`Unknown tool: ${request.params.name}`)
  }
})

// 关键：在 /mcp 路由处理 SSE 连接
app.post('/mcp', async (req, res) => {
  const transport = new SSEServerTransport('/mcp', res)
  await server.connect(transport)
})

const PORT = 4000
app.listen(PORT, () => {
  console.log(`MCP server running on http://localhost:${PORT}/mcp`)
})

//  这个是 demo 服务
