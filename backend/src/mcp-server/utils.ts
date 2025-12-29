import { ParsedAgentResponse } from '../types/agent'

function parseAgentResponse(response: any, executionTime?: number): ParsedAgentResponse {
  // 1. 提取用户消息
  const userMessage = response.messages
    .find((msg: any) => msg.role === 'user')?.content || ''

  // 2. 提取所有工具调用
  const toolCalls = response.messages
    .filter((msg: any) => msg.tool_calls?.length > 0)
    .flatMap((msg: any) =>
      msg.tool_calls.map((call: any) => ({
        name: call.function.name,
        arguments: JSON.parse(call.function.arguments),
        id: call.id,
      })),
    )

  // 3. 提取所有工具结果
  const toolResults = response.messages
    .filter((msg: any) => msg.role === 'tool')
    .map((msg: any, index: number) => ({
      toolName: 'tool',  // 如果有更多信息可以提取
      result: msg.content,
      callId: msg.tool_call_id || `result_${index}`,
    }))

  // 4. 提取最终答案
  const finalMessage = response.messages[response.messages.length - 1]
  const finalAnswer = finalMessage?.content || ''

  // 5. 组装返回值
  return {
    userMessage,
    toolCalls,
    toolResults,
    finalAnswer,
    messages: response.messages,
    metadata: {
      totalMessages: response.messages.length,
      hasToolCalls: toolCalls.length > 0,
      hasErrors: false,  // 可以根据需要检测错误
      executionTime,
    },
  }
}

// 打印函数（可选，用于调试）
function printParsedResponse(parsed: ParsedAgentResponse): void {
  console.log('\n' + '='.repeat(50))
  console.log('📝 User Question:', parsed.userMessage)

  if (parsed.toolCalls.length > 0) {
    console.log('\n🔧 Tools Called:')
    parsed.toolCalls.forEach(call => {
      console.log(`  - ${call.name}(${JSON.stringify(call.arguments)})`)
    })
  }

  if (parsed.toolResults.length > 0) {
    console.log('\n📊 Tool Results:')
    parsed.toolResults.forEach(result => {
      console.log(`  - ${result.result}`)
    })
  }

  console.log('\n💬 Final Answer:', parsed.finalAnswer)

  if (parsed.metadata.executionTime) {
    console.log(`\n⏱️  Execution time: ${parsed.metadata.executionTime}ms`)
  }
  console.log('='.repeat(50) + '\n')
}


export { parseAgentResponse, printParsedResponse }
