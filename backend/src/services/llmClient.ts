import {AgentResult, ToolResult} from "../types";
import {MemorySaver} from "@langchain/langgraph";
import {GraphState, workflow} from "../graph/workflow";


const checkpointer = new MemorySaver();
const app = workflow.compile({checkpointer});

export class AgentClient {
  async processMessage(
    messages: Array<{ role: string; content: string }>,
    userId: string = "user_123",
    conversationId: string = "default"
  ): Promise<AgentResult> {

    const config = {
      configurable: {
        thread_id: `${userId}_${conversationId}`
      }
    };

    const initialState: GraphState = {
      messages: messages,
      sceneObjects: [],
      userId,
      conversationId,
    };

    const result = await app.invoke(initialState, config);

    const drawnObjects: Array<ToolResult> = [];
    for (const msg of result.messages) {
      if (msg.role === 'tool') {
        try {
          drawnObjects.push(JSON.parse(msg.content));
        } catch (e) {
          console.error('解析 tool 结果失败:', e);
        }
      }
    }

    return {
      response: result.messages[result.messages.length - 1].content as string,
      drawnObjects,
      messages: result.messages
    };
  }
}

export const agentClient = new AgentClient();
