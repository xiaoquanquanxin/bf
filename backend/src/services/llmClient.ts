// 导入 OpenAI 聊天模型
import {ChatOpenAI} from '@langchain/openai';
// 导入 LangChain Agent 创建函数
import {createAgent} from 'langchain';
// 导入画线工具
import {drawLineTool} from "../tools";

// 基于 LangChain 的 Agent 客户端
export class AgentClient {
  // 私有 Agent 实例
  private agent: any;

  constructor() {
    // 初始化 OpenAI 模型
    const model = new ChatOpenAI({
      // API 密钥
      apiKey: process.env.API_KEY!,
      // API 配置
      configuration: {
        // API 基础地址
        baseURL: process.env.BASE_URL!,
      },
      // 模型名称
      model: process.env.MODEL_NAME!,
      // 温度参数
      temperature: 0.1,
    });

    // 创建 Agent 实例
    this.agent = createAgent({
      // 语言模型
      model,
      // 可用工具列表
      tools: [drawLineTool],
      // 系统提示词
      systemPrompt: '你是一个3D建模和电气设计助手，可以帮助用户创建几何体和电路元件。'
    });
  }

  // 处理消息方法
  async processMessage(messages: Array<{ role: string; content: string }>): Promise<string> {
    // 调试输出：分析前
    console.log('分析之前')
    console.log(messages)
    // 调用 Agent 处理消息
    const result = await this.agent.invoke({messages});
    // 调试输出：分析后
    console.log('分析之后')
    // 获取最后一条消息
    const lastMessage = result.messages[result.messages.length - 1];
    // 调试输出：服务端结果
    console.log('服务端输出', lastMessage.content)
    // 返回消息内容
    return lastMessage.content;
  }
}

// 导出 Agent 客户端单例
export const agentClient = new AgentClient();
