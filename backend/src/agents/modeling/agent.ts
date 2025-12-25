import {RunnableConfig} from "@langchain/core/runnables";
import {END, START, StateGraph} from "@langchain/langgraph";
import {ChatOpenAI} from "@langchain/openai";
import * as z from "zod";
import {drawLineTool} from "./tools/drawLineTool";
import {saveDataTool} from "./tools/saveDataTool";

const State = z.object({
  messages: z.array(z.any()),
});

type ModelingState = z.infer<typeof State>;

const llm = new ChatOpenAI({
  apiKey: process.env.API_KEY!,
  configuration: {baseURL: process.env.BASE_URL!},
  model: process.env.MODEL_NAME!,
  temperature: 0.1,
  streaming: true,  // ✅ 启用流式
});

const tools = {
  draw_line: drawLineTool,
  save_data: saveDataTool,
} as const;

type ToolName = keyof typeof tools;

const llmWithTools = llm.bindTools(Object.values(tools));

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

// ✅ 关键修改：添加 config 参数，并使用 config.writer 逐令牌发送
const callModel = async (state: ModelingState, config?: RunnableConfig) => {
  const messages = [
    {role: "system", content: systemPrompt},
    ...state.messages
  ];

  let fullContent = "";
  let hasToolCalls = false;
  let toolCalls: any[] = [];

  // 使用 stream() 获取流式令牌
  const stream = await llmWithTools.stream(messages, config);

  for await (const chunk of stream) {
    // 累积文本内容
    if (chunk.content) {
      fullContent += chunk.content;
      // ✅ 逐令牌发送给客户端（通过 config.writer）
      config?.writer?.(chunk.content);
    }

    // 检查是否有 tool_calls
    if (chunk.tool_calls && chunk.tool_calls.length > 0) {
      hasToolCalls = true;
      toolCalls = chunk.tool_calls;
    }
  }

  // 构建完整消息对象
  const response: any = {
    role: "assistant",
    content: fullContent,
  };

  // 如果有工具调用，也要加入响应中
  if (hasToolCalls) {
    response.tool_calls = toolCalls;
  }

  return {
    messages: [...state.messages, response],
  };
};

const executeTool = async (state: ModelingState) => {
  const lastMessage = state.messages.at(-1);
  const toolCalls = lastMessage.tool_calls;

  const toolResults = [];
  for (const call of toolCalls) {
    try {
      const toolName = call.name as ToolName;
      const tool = tools[toolName] as any;
      const result = await tool.invoke(call.args);

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

const shouldCallTool = (state: ModelingState) => {
  const lastMessage = state.messages.at(-1);
  const hasToolCalls = lastMessage.tool_calls && lastMessage.tool_calls.length > 0;
  return hasToolCalls ? "tool" : "end";
};

export const modelingWorkflow = new StateGraph(State)
  .addNode("model", callModel)
  .addNode("tool", executeTool)
  .addEdge(START, "model")
  .addConditionalEdges("model", shouldCallTool, {
    tool: "tool",
    end: END,
  })
  .addEdge("tool", "model");

export type {ModelingState};
