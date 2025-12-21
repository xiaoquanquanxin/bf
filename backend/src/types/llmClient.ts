// 服务端统一返回这个格式
type ToolResult<T = any> = {
  success: boolean;
  id: string;           // 该对象在场景中的唯一标识
  data: T;              // 具体的几何数据
  message: string;      // 人类可读的描述
  timestamp: number;
};

// LangGraph Agent 返回结果的类型
interface AgentResult {
  response: string;                     // AI 的回复内容
  drawnObjects: Array<ToolResult>;      // 工具执行结果
  messages: Array<any>;                 // 完整的消息历史
}

export {ToolResult, AgentResult}
