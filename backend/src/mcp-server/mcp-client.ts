import { MultiServerMCPClient } from '@langchain/mcp-adapters'
import { resolve } from 'path'

export interface MCPInstance {
  client: MultiServerMCPClient;
  tools: any[];
}

let mcp: MCPInstance | null = null
let initPromise: Promise<MCPInstance> | null = null

async function getMCP(): Promise<MCPInstance> {
  if (mcp) {
    return mcp
  }

  if (initPromise) {
    return await initPromise
  }

  initPromise = (async () => {
    console.log('📍 Initializing MCP...')

    const client = new MultiServerMCPClient({
      math: {
        transport: 'stdio',
        command: 'npx',
        args: ['ts-node', resolve(__dirname, '../../mcp-server/math_server.ts')],
      },
    })

    const tools = await client.getTools()
    console.log(`✅ MCP ready with ${tools.length} tools`)

    mcp = { client, tools }
    return mcp
  })()

  return await initPromise
}

async function closeMCP() {
  mcp = null
  initPromise = null
}


export { getMCP, closeMCP }
