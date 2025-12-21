import { MemorySaver } from "@langchain/langgraph";
import { userWorkflow, UserState } from "./agent";
import { AgentResult, ToolResult } from "../../types";

const checkpointer = new MemorySaver();
const userApp = userWorkflow.compile({ checkpointer });

export class UserAgent {
  async chat(
    messages: Array<{ role: string; content: string }>,
    userId: string = "user_123",
    conversationId: string = "default"
  ): Promise<AgentResult> {
    
    const config = {
      configurable: { 
        thread_id: `user_${userId}_${conversationId}` 
      }
    };

    const initialState: UserState = {
      messages: messages,
    };

    const result = await userApp.invoke(initialState, config);
    
    const userData: Array<ToolResult> = [];
    for (const msg of result.messages) {
      if (msg.role === 'tool') {
        try {
          userData.push(JSON.parse(msg.content));
        } catch (e) {
          console.error('解析用户工具结果失败:', e);
        }
      }
    }

    return {
      response: result.messages[result.messages.length - 1].content as string,
      drawnObjects: userData, // 复用字段名，实际是用户数据
      messages: result.messages
    };
  }
}

export const userAgent = new UserAgent();