import {MemorySaver} from "@langchain/langgraph";
import {UserState, userWorkflow} from "./agent";
import {StreamEvent} from "../../types";

const checkpointer = new MemorySaver();
const userApp = userWorkflow.compile({checkpointer});

export class UserAgent {
  async* chatStream(
    messages: Array<{ role: string; content: string }>,
    userId: string = "user_123",
    conversationId: string = "default"
  ): AsyncGenerator<StreamEvent> {
    const config = {
      configurable: {
        thread_id: `user_${userId}_${conversationId}`
      }
    };

    const initialState: UserState = {
      messages: messages,
    };

    const stream = userApp.stream(initialState, config);

    for await (const chunk of await stream) {
      const [nodeName, nodeOutput] = Object.entries(chunk)[0];

      if (nodeName === 'model') {
        const lastMessage = nodeOutput.messages[nodeOutput.messages.length - 1];
        if (lastMessage.content) {
          yield {
            type: 'message',
            data: {content: lastMessage.content}
          };
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
            console.error('解析用户工具结果失败:', e);
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

export const userAgent = new UserAgent();
