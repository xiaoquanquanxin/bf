import {BaseMessage} from "@langchain/core/messages";

// 服务端统一返回这个格式
type ToolResult<T> = {
  success: boolean;
  id: string;           // 该对象在场景中的唯一标识
  data: T;              // 具体的几何数据
  message: string;      // 人类可读的描述
  timestamp: number;
};

// 定义 Agent 返回结果的类型
interface AgentResult {
  messages: BaseMessage[];
  // 如果还有其他字段，继续添加
}

export {ToolResult, AgentResult}
