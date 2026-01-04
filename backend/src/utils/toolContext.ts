/**
 * 工具上下文管理器
 * 用于在 Agent 执行期间传递 userId 和 conversationId
 */
class ToolContext {
  private context: Map<string, { userId: string; conversationId: string }> = new Map();

  /**
   * 设置当前执行的上下文
   * 在 Agent 开始处理请求时调用
   */
  set(key: string, userId: string, conversationId: string): void {
    this.context.set(key, { userId, conversationId });
  }

  /**
   * 获取当前上下文
   * 在工具执行时调用
   */
  get(key: string = 'default'): { userId: string; conversationId: string } {
    return this.context.get(key) || { userId: 'user_123', conversationId: 'default' };
  }

  /**
   * 清除上下文
   */
  clear(key: string): void {
    this.context.delete(key);
  }
}

export const toolContext = new ToolContext();
