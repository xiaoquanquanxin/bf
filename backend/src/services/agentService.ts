// 导入 UUID 生成库，用于生成唯一标识符
import { v4 as uuidv4 } from 'uuid';
// 导入 LLM 客户端，用于与大语言模型交互
import { llmClient } from './llmClient';
// 导入工具定义，用于 LLM 函数调用
import { tools } from './workflow/tools';
// 导入系统提示词生成函数
import { getSystemPrompt } from './workflow/prompts';
// 导入相关类型定义
import { WorkflowState, ChatResponse, FrontendAction } from '../models/types';

// Agent 服务类，负责处理聊天逻辑和工作流管理
class AgentService {
  // 私有属性：存储所有对话的状态信息
  private conversations: Map<string, WorkflowState> = new Map();

  // 处理用户消息的主要方法
  async processMessage(
    message: string,        // 用户输入的消息
    userId: string,         // 用户唯一标识符
    conversationId?: string, // 可选的对话ID
    extraInfo?: any         // 可选的额外信息
  ): Promise<[ChatResponse, string]> {
    // 获取或生成对话ID
    const convId = conversationId || uuidv4();
    
    // 获取或初始化对话状态
    let state = this.conversations.get(convId) || {
      messages: [],                                           // 消息历史
      userId,                                                 // 用户ID
      currentStep: 'init',                                    // 当前步骤
      options: extraInfo || ['选项A', '选项B', '选项C']  // 可选项列表
    } as WorkflowState;

    // 将用户消息添加到对话历史中
    state.messages.push({ role: 'user', content: message });

    // 根据当前状态生成系统提示词
    const systemPrompt = getSystemPrompt(state);
    // 构建完整的消息列表（系统提示 + 对话历史）
    const messages = [
      { role: 'system', content: systemPrompt },
      ...state.messages
    ];

    // 调用 LLM 进行对话，传入消息和可用工具
    const llmResponse = await llmClient.chat(messages, tools);

    // 初始化响应对象和前端操作数组
    let response: ChatResponse = { mainMessage: '' };
    let frontendActions: FrontendAction[] = [];

    // 检查 LLM 是否调用了工具
    if (llmResponse.tool_calls && llmResponse.tool_calls.length > 0) {
      // 获取第一个工具调用
      const toolCall = llmResponse.tool_calls[0];
      const toolName = toolCall.function.name;                    // 工具名称
      const toolArgs = JSON.parse(toolCall.function.arguments || '{}'); // 工具参数

      // 记录工具调用日志
      console.log(`[LLM] 调用工具: ${toolName}`, toolArgs);

      // 根据不同的工具名称执行相应的逻辑
      if (toolName === 'start_task') {
        // 开始任务：进入选项选择阶段
        state.currentStep = 'select_option';
        frontendActions.push({ method: 'showOptions', params: { options: state.options } });
        response.mainMessage = '好的！请选择一个选项：';
      } else if (toolName === 'select_option') {
        // 选择选项：处理用户的选项选择
        const option = toolArgs.option;
        if (option) {
          // 有效选项：保存选择并进入准备执行阶段
          state.selectedOption = option;
          state.currentStep = 'ready';
          response.mainMessage = `您选择了：${option}。\n\n确认执行吗？`;
        } else {
          // 无效选项：重新显示选项列表
          state.currentStep = 'select_option';
          frontendActions.push({ method: 'showOptions', params: { options: state.options } });
          response.mainMessage = '请选择一个选项：';
        }
      } else if (toolName === 'execute_task') {
        // 执行任务：完成任务执行
        state.currentStep = 'complete';
        frontendActions.push({
          method: 'executeTask',
          params: { option: state.selectedOption }
        });
        response.mainMessage = `✅ 任务执行完成！选项：${state.selectedOption}`;
      } else if (toolName === 'reject_request') {
        // 拒绝请求：处理与任务无关的请求
        response.mainMessage = '抱歉，我只能帮您处理任务相关的请求。';
      }
    } else {
      // 没有工具调用：直接使用 LLM 的响应内容
      response.mainMessage = llmResponse.content || '处理中...';
    }

    // 如果有前端操作，则添加到响应中
    if (frontendActions.length > 0) {
      response.frontend_actions = frontendActions;
    }

    // 保存更新后的对话状态
    this.conversations.set(convId, state);
    // 返回响应和对话ID
    return [response, convId];
  }
}

// 导出 AgentService 的单例
export const agentService = new AgentService();
