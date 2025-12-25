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
      // 同时用两个模式
      const stream = await modelingApp.stream(
        initialState,
        {
          ...config,
          streamMode: ['messages', 'updates']  // 两个都要
        }
      );

      for await (const [streamMode, chunk] of stream) {
        if (streamMode === 'messages') {
          console.log(chunk[0])
          // 处理 LLM 令牌流 → 显示逐字对话
          yield {
            type: 'message',
            data: {content: chunk[0].content}
          };
        } else if (streamMode === 'updates') {
          // 处理工具执行结果 → 显示 3D 操作结果
          const [nodeName, nodeOutput] = Object.entries(chunk)[0];
          if (nodeName === 'tool') {
            yield {
              type: 'tool',
              data: nodeOutput
            };
          }
        }
      }

      yield {
        type: 'end',
        data: {}
      };
    } catch (error) {
      console.error('LangGraph stream 错误:', error);
      yield {
        type: 'error',
        data: {message: '执行失败'}
      };
    }
  }
}

export const modelingAgent = new ModelingAgent();
