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
      // ✅ 用 "messages" 模式，这样能逐令牌接收
      const stream = await modelingApp.stream(
        initialState,
        {
          ...config,
          streamMode: "messages"
        }
      );

      for await (const [token, metadata] of stream) {
        // token 是真实的令牌，逐个到达，无需 setTimeout
        if (token.contentBlocks && token.contentBlocks.length > 0) {
          for (const block of token.contentBlocks) {
            if (block.type === 'text' && block.text) {
              yield {
                type: 'message',
                data: {content: block.text}
              };
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
