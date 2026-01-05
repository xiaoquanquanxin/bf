import {MemorySaver} from "@langchain/langgraph";
import {ModelingState, modelingWorkflow} from "./agent";
import {StreamEvent} from "../../types";
import {toolContext} from "../../utils/toolContext";

const checkpointer = new MemorySaver();
const modelingApp = modelingWorkflow.compile({checkpointer});

export class ModelingAgent {
  async* chatStream(
    messages: Array<{ role: string; content: string }>,
    userId: string = "user_123",
    conversationId: string = "default"
  ): AsyncGenerator<StreamEvent> {
    // 设置工具上下文,供清单工具使用
    toolContext.set('modeling', userId, conversationId);

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

      for await (const chunk of await stream) {
        const [nodeName, nodeOutput] = Object.entries(chunk)[0];

        if (nodeName === 'model') {
          // 处理模型输出
          const lastMessage = nodeOutput.messages[nodeOutput.messages.length - 1];
          if (lastMessage.content) {
            yield {
              type: 'message',
              data: {content: lastMessage.content}
            };
          }
        } else if (nodeName === 'tool') {
          // 处理工具执行结果
          const toolMessages = nodeOutput.messages.filter((msg: any) => msg.role === 'tool');
          for (const toolMsg of toolMessages) {
            try {
              const toolResult = JSON.parse(toolMsg.content);
              yield {
                type: 'tool',
                data: toolResult
              };
            } catch (e) {
              console.error('❌ 解析工具结果失败:', e);
            }
          }
        }
      }

      yield {type: 'end', data: {}};
    } catch (error) {
      console.error('❌ [Agent] 错误:', error);
      yield {type: 'error', data: {message: '执行失败'}};
    }
  }
}

export const modelingAgent = new ModelingAgent();
