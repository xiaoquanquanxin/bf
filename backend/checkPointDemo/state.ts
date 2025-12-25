import {Message} from "@langchain/core/messages";

// State = 单次运行中的临时数据

interface State {
  messages: Message[],
  queryResult: any,
  chartData: any
}

// 特点：
// - 一次 invoke() 中生效
// - invoke() 结束就消失（除非保存到 checkpoint）
// - Supervisor Agent 和所有 SubAgent 都可以访问
