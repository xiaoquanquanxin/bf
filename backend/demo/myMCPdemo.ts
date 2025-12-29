import { MultiServerMCPClient } from '@langchain/mcp-adapters'
import { ChatOpenAI } from '@langchain/openai'
import { createAgent } from 'langchain'
import { resolve } from 'path'

async function myMCPdemo() {
  // 创建 MCP Client，告诉它 Server 在哪里
  const client = new MultiServerMCPClient({
    math: {
      transport: 'stdio',  // 通过标准输入/输出通信
      command: 'npx',  // 用什么命令启动服务器
      args: ['ts-node', resolve(__dirname, '../../mcp-server/math_server.ts')],  // 服务器文件的绝对路径
    },
  })
  // 获取 Server 暴露的工具列表
  const tools = await client.getTools()
  const model = new ChatOpenAI({
    apiKey: process.env.API_KEY!,
    configuration: {
      baseURL: process.env.BASE_URL!,
    },
    model: process.env.MODEL_NAME!,
    temperature: 0.1,
    streaming: false,
  })
  const agent = createAgent({
    model,
    tools,
  })
  await new Promise(resolve => setTimeout(resolve, 3000))
  const invokeStart = Date.now()
  try {
    const response = await agent.invoke({
      messages: [{ role: 'user', content: 'What is 5 + 3?' }],
    })
    const elapsed = Date.now() - invokeStart
    const lastMessage = response.messages[response.messages.length - 1]
    console.log(lastMessage.content)
  } catch (error) {
    // console.error('Agent invoke error:', error)
  }
}

export { myMCPdemo }
