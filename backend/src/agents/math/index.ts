import { ChatOpenAI } from '@langchain/openai'
import { createAgent } from 'langchain'
import { getMCP } from '../../mcp-server'

async function myMCPdemo() {
  // 创建 MCP Client，告诉它 Server 在哪里
  const { client, tools } = await getMCP()
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
  try {
    const response = await agent.invoke({
      messages: [{ role: 'user', content: 'What is 5 + 3?' }],
    })
    const lastMessage = response.messages[response.messages.length - 1]
    console.log('💬 MCP 计算结果:', lastMessage.content)
  } catch (error) {
    // console.error('Agent invoke error:', error)
  }
}

export { myMCPdemo }
