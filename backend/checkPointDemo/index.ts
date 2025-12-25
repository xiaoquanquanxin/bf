import {Message} from "@langchain/core/messages";

// ===== 全局 State（Supervisor 级别）=====
interface SupervisorState {
  messages: Message[],  // Supervisor 的对话历史
  userRequest: string,

  // 各 SubAgent 的结果存在这里
  queryResult?: QueryOutput,
  chartResult?: ChartOutput,
  outputResult?: OutputData,

  // 一个关键字段：当前执行的是哪个 Agent
  currentAgent?: 'query' | 'chart' | 'output',

  // 每个 Agent 的 thread_id（用于恢复其状态）
  agentThreadIds: {
    query?: string,
    chart?: string,
    output?: string
  }
}

// ===== 各 SubAgent 的独立 State（自己管理）=====
// Query Agent 内部
interface QueryAgentState {
  messages: Message[],  // 只有 Query Agent 知道这个
  query_params: any,
  results: any[]
}

// Chart Agent 内部
interface ChartAgentState {
  messages: Message[],  // 只有 Chart Agent 知道这个
  chart_config: any,
  chart_data: any
}

// Output Agent 内部
interface OutputAgentState {
  messages: Message[],  // 只有 Output Agent 知道这个
  format: string,
  content: any
}
