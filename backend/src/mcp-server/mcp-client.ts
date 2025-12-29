import { MultiServerMCPClient } from '@langchain/mcp-adapters'
import { resolve } from 'path'

export interface MCPInstance {
  client: MultiServerMCPClient;
  tools: any[];
}

let mcp: MCPInstance | null = null
let initPromise: Promise<MCPInstance> | null = null

/**
 * 获取 MCP (Model Context Protocol) 实例
 * 如果已存在则直接返回，否则创建新的连接到数学计算服务器
 * @returns Promise<MCPInstance> MCP 客户端和工具列表
 */
const getMCP = async (): Promise<MCPInstance> => {
  if (mcp) {
    return mcp
  }

  if (initPromise) {
    return await initPromise
  }

  initPromise = (async () => {
    console.log('📍 初始化 MCP...')

    // 创建多服务器 MCP 客户端，连接到数学计算服务器
    const client = new MultiServerMCPClient({
      math: {
        transport: 'stdio',
        command: 'npx',
        args: ['ts-node', resolve(__dirname, '../mcp-server/math_server.ts')],
      },
    })

    // 获取服务器提供的工具列表
    const tools = await client.getTools()
    console.log(`✅ MCP 就绪，共 ${tools.length} 个工具`)

    mcp = { client, tools }
    return mcp
  })()

  return await initPromise
}

/**
 * 关闭 MCP 连接并清理资源
 * 重置全局状态，允许重新初始化
 */
const closeMCP = async () => {
  if (mcp?.client) {
    // 如果客户端有 close 方法，调用它
    try {
      await mcp.client.close?.()
  console.log('🔌 MCP 连接已关闭')
    } catch (error) {
      console.warn('⚠️ 关闭 MCP 客户端错误:', error)
    }
  }

  mcp = null
  initPromise = null
}

export { getMCP, closeMCP }
