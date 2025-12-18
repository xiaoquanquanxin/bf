// 导入 OpenAI SDK，用于与大语言模型交互
import OpenAI from 'openai';

// LLM 客户端类，封装与大语言模型的交互逻辑
export class LLMClient {
  // 私有属性：OpenAI 客户端实例
  private client: OpenAI;

  // 构造函数：初始化 OpenAI 客户端
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.API_KEY!,     // 从环境变量获取 API 密钥
      baseURL: process.env.BASE_URL!,  // 从环境变量获取 API 基础地址
    });
  }

  // 聊天方法：发送消息给 LLM 并获取响应
  async chat(messages: Array<{ role: string; content: string }>, tools?: any[]): Promise<any> {
    // 构建请求参数
    const params: any = {
      model: process.env.MODEL_NAME!, // 从环境变量获取模型名称
      messages,                 // 消息列表
      temperature: 0.1,         // 温度参数，控制响应的随机性（较低值表示更稳定）
    };

    // 如果提供了工具，则启用函数调用功能
    if (tools && tools.length > 0) {
      params.tools = tools;           // 可用工具列表
      params.tool_choice = 'auto';    // 自动选择是否使用工具
    }

    // 调用 OpenAI API 创建聊天完成
    const response = await this.client.chat.completions.create(params);
    // 返回第一个选择的消息内容
    return response.choices[0].message;
  }
}

// 导出 LLMClient 的单例
export const llmClient = new LLMClient();
