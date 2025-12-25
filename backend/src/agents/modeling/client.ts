import {MemorySaver} from "@langchain/langgraph";
import {ModelingState, modelingWorkflow} from "./agent";
import {StreamEvent} from "../../types";

const checkpointer = new MemorySaver();
const modelingApp = modelingWorkflow.compile({checkpointer});

export class ModelingAgent {
  async* chatStream(
    messages: Array<{ role: string; content: string }>,
    userId: string = "user_123",
    conversationId: string = "default"
  ): AsyncGenerator<StreamEvent> {
    const config = {
      configurable: {
        thread_id: `modeling_${userId}_${conversationId}`
      }
    };

    const initialState: ModelingState = {
      messages: messages,
    };

    try {
      const stream = await modelingApp.stream(initialState, config);

      for await (const chunk of stream) {
        const [nodeName, nodeOutput] = Object.entries(chunk)[0];

        if (nodeName === 'model') {
          const lastMessage = nodeOutput.messages[nodeOutput.messages.length - 1];
          if (lastMessage.content) {
            // 逐字符输出 AI 回复
            const content = lastMessage.content as string;
            for (let i = 0; i < content.length; i++) {
              yield {
                type: 'message',
                data: {content: content[i]}
              };
              await new Promise(resolve => setTimeout(resolve, 20));
            }
          }
        } else if (nodeName === 'tool') {
          const toolMessages = nodeOutput.messages.filter((msg: any) => msg.role === 'tool');
          for (const toolMsg of toolMessages) {
            try {
              const toolResult = JSON.parse(toolMsg.content);
              yield {
                type: 'tool',
                data: toolResult
              };
            } catch (e) {
              console.error('解析 tool 结果失败:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('LangGraph stream 错误:', error);
      // 如果 stream 失败，使用普通调用
      const result = await modelingApp.invoke(initialState, config);

      const response = result.messages[result.messages.length - 1].content as string;
      for (let i = 0; i < response.length; i++) {
        yield {
          type: 'message',
          data: {content: response[i]}
        };
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      // 处理工具结果
      for (const msg of result.messages) {
        if (msg.role === 'tool') {
          try {
            const toolResult = JSON.parse(msg.content);
            yield {
              type: 'tool',
              data: toolResult
            };
          } catch (e) {
            console.error('解析 tool 结果失败:', e);
          }
        }
      }
    }

    yield {
      type: 'end',
      data: {}
    };
  }
}

export const modelingAgent = new ModelingAgent();
