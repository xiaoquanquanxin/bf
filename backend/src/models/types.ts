// 聊天请求接口定义
export interface ChatRequest {
  message: string;           // 用户发送的消息内容
  userId: string;            // 用户唯一标识符
  conversationId?: string;   // 可选的对话ID，用于标识特定对话
  stream: boolean;           // 是否启用流式响应
  extraInfo?: any;           // 可选的额外信息，类型为任意类型
}

// 前端操作接口定义
export interface FrontendAction {
  method: string;                    // 前端需要执行的方法名
  params: Record<string, any>;       // 方法参数，键值对形式
}

// 聊天响应接口定义
export interface ChatResponse {
  mainMessage: string;                   // 主要响应消息内容
  frontend_actions?: FrontendAction[];   // 可选的前端操作数组
}

// 工作流状态接口定义
export interface WorkflowState {
  messages: Array<{ role: string; content: string }>;  // 消息历史数组，包含角色和内容
  userId: string;                                       // 用户唯一标识符
  currentStep: string;                                  // 当前工作流步骤
  selectedOption?: string;                              // 可选的用户选择项
  options: string[];                                    // 可用选项数组
}
