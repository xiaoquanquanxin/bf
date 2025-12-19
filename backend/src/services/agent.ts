import {AgentResult} from "../types";
// 导入 Agent 客户端
import {agentClient} from './llmClient';

// Agent 服务类
class Agent {
  // 处理用户消息
  async processMessage(message: string, userId: string): Promise<AgentResult> {
    // 构建消息数组
    const messages = [
      {role: 'user', content: message}
    ];

    // 调用 Agent 客户端处理消息
    return await agentClient.processMessage(messages);
  }
}

// 导出 Agent 实例
export const agent = new Agent();
