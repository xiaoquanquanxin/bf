// 聊天相关的类型定义

export interface ChatRequest {
  message: string;
  userId: string;
  conversationId: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
}