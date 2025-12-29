export interface ParsedAgentResponse {
  // 用户输入
  userMessage: string;

  // Agent 的思考过程
  toolCalls: Array<{
    name: string;
    arguments: Record<string, any>;
    id: string;
  }>;

  // 工具执行结果
  toolResults: Array<{
    toolName: string;
    result: string;
    callId: string;
  }>;

  // 最终答案
  finalAnswer: string;

  // 完整的消息历史（为了继续对话）
  messages: any[];

  // 元数据
  metadata: {
    totalMessages: number;
    hasToolCalls: boolean;
    hasErrors: boolean;
    executionTime?: number;
  };
}