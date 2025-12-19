import {ChatOpenAI} from '@langchain/openai';
import {createAgent} from 'langchain';
import {drawLineTool} from "../tools";

// 基于 LangChain 的 Agent 客户端
export class AgentClient {
  private agent: any;

  constructor() {
    const model = new ChatOpenAI({
      apiKey: process.env.API_KEY!,
      configuration: {
        baseURL: process.env.BASE_URL!,
      },
      model: process.env.MODEL_NAME!,
      temperature: 0.1,
    });

    this.agent = createAgent({
      model,
      tools: [drawLineTool],
      systemPrompt: '你是一个3D建模和电气设计助手，可以帮助用户创建几何体和电路元件。'
    });
  }

  async processMessage(messages: Array<{ role: string; content: string }>): Promise<string> {
    const result = await this.agent.invoke({messages});
    const lastMessage = result.messages[result.messages.length - 1];
    return lastMessage.content;
  }
}

export const agentClient = new AgentClient();
