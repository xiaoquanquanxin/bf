import { MemorySaver } from "@langchain/langgraph";
import { modelingWorkflow, ModelingState } from "./agent";
import { AgentResult, ToolResult } from "../../types";

const checkpointer = new MemorySaver();
const modelingApp = modelingWorkflow.compile({ checkpointer });

export class ModelingAgent {
  async chat(
    messages: Array<{ role: string; content: string }>,
    userId: string = "user_123",
    conversationId: string = "default"
  ): Promise<AgentResult> {
    
    const config = {
      configurable: { 
        thread_id: `modeling_${userId}_${conversationId}` 
      }
    };

    const initialState: ModelingState = {
      messages: messages,
    };

    const result = await modelingApp.invoke(initialState, config);
    
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

export const modelingAgent = new ModelingAgent();