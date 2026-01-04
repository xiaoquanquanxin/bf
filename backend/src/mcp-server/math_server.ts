import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

const math_server = new Server(
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

math_server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'add',
        description: 'Add two numbers',
        inputSchema: {
          type: 'object',
          properties: {
            a: {
              type: 'number',
              description: 'First number',
            },
            b: {
              type: 'number',
              description: 'Second number',
            },
          },
          required: ['a', 'b'],
        },
      },
      {
        name: 'multiply',
        description: 'Multiply two numbers',
        inputSchema: {
          type: 'object',
          properties: {
            a: {
              type: 'number',
              description: 'First number',
            },
            b: {
              type: 'number',
              description: 'Second number',
            },
          },
          required: ['a', 'b'],
        },
      },
    ],
  }
})

math_server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.log('🔍 调用工具:', request.params.name)
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
    case 'multiply': {
      const { a, b } = request.params.arguments as { a: number; b: number }
      return {
        content: [
          {
            type: 'text',
            text: String(a * b),
          },
        ],
      }
    }
    default:
      throw new Error(`Unknown tool: ${request.params.name}`)
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await math_server.connect(transport)
  console.error('🧮 数学 MCP 服务器在 stdio 上运行')
}

main()
