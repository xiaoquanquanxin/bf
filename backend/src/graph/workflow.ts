import {END, START, StateGraph} from "@langchain/langgraph";
import {ChatOpenAI} from "@langchain/openai";
import * as z from "zod";
import {drawLineTool} from "../tools";
import {saveDataTool} from "../tools/saveDataTool";

// 定义状态
const State = z.object({
  messages: z.array(z.any()),
  sceneObjects: z.array(z.any()).default([]),
  userId: z.string().default(""),
  conversationId: z.string().default(""),
});

type GraphState = z.infer<typeof State>;

// 创建模型
const llm = new ChatOpenAI({
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

// 工具映射
const toolMap: Record<string, Function> = {
  draw_line: async (input: any) => {
    return await drawLineTool.invoke(input);
  },
  save_data: async (input: any) => {
    return await saveDataTool.invoke(input);
  },
};

// 绑定工具到 LLM
const llmWithTools = llm.bindTools([drawLineTool, saveDataTool]);

// 系统提示词
const systemPrompt = `你是一个专业的3D建模助手。

你只能执行以下操作：
- 画线（draw_line）：在3D空间中绘制线段
- 保存数据（save_data）：保存创建的对象到数据库

重要规则：
1. 每次成功创建3D对象后，必须立即调用 save_data 保存
2. save_data 的参数：objectId（对象ID）、data（对象数据）、type（对象类型如'line'）

工作流程：
1. 用户请求画线 → 调用 draw_line
2. 画线成功 → 立即调用 save_data 保存
3. 向用户报告结果

对于无法完成的请求，请明确告诉用户：
"抱歉，我无法完成[具体请求]。我只能帮您在3D空间中画线。请告诉我起点和终点坐标，或者起点、方向和距离。"`;

// 节点 1：调用 LLM
const callModel = async (state: GraphState) => {
  const messages = [
    {role: "system", content: systemPrompt},
    ...state.messages
  ];
  const response = await llmWithTools.invoke(messages);
  return {
    messages: [...state.messages, response],
  };
};

// 节点 2：执行工具
const executeTool = async (state: GraphState) => {
  const lastMessage = state.messages.at(-1);
  const toolCalls = lastMessage.tool_calls;

  const toolResults = [];
  for (const call of toolCalls) {
    try {
      const result = await toolMap[call.name](call.args);
      toolResults.push({
        role: "tool",
        content: JSON.stringify(result),
        tool_call_id: call.id,
      });
    } catch (error) {
      toolResults.push({
        role: "tool",
        content: `Error: ${(error as any).message}`,
        tool_call_id: call.id,
      });
    }
  }

  return {
    messages: [...state.messages, ...toolResults],
  };
};

// 条件：是否有工具调用
const shouldCallTool = (state: GraphState) => {
  const lastMessage = state.messages.at(-1);
  const hasToolCalls = lastMessage.tool_calls && lastMessage.tool_calls.length > 0;

  // console.log('🔍 判断是否需要工具:');
  // console.log('- 最后消息:', lastMessage.content);
  // console.log('- 工具调用:', lastMessage.tool_calls);
  // console.log('- 判断结果:', hasToolCalls ? 'tool' : 'end');

  return hasToolCalls ? "tool" : "end";
};

// 构建图
export const workflow = new StateGraph(State)
  .addNode("model", callModel)
  .addNode("tool", executeTool)
  .addEdge(START, "model")
  .addConditionalEdges("model", shouldCallTool, {
    tool: "tool",
    end: END,
  })
  .addEdge("tool", "model");

export type {GraphState};
