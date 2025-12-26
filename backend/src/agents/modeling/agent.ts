import {END, START, StateGraph} from "@langchain/langgraph";
import {ChatOpenAI} from "@langchain/openai";
import * as z from "zod";
import {drawLineTool} from "./tools/drawLineTool";
import {saveDataTool} from "./tools/saveDataTool";
import {dispatchDrawLine} from "./tools/dispatchDrawLine";

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
  dispatch_draw_line: dispatchDrawLine,
  save_data: saveDataTool,
} as const;

type ToolName = keyof typeof tools;

const llmWithTools = llm.bindTools(Object.values(tools));

const systemPrompt = `你是一个专业的3D建模助手。

你只能执行以下操作：
- 画线（draw_line）：生成一条线段的数据
- 推送前端方法（dispatch_draw_line）：让前端在3D空间中绘制线段
- 保存数据（save_data）：保存创建的对象到数据库

重要规则：
1. 每次成功创建3D对象后，必须立即调用 save_data 保存
2. save_data 的参数：objectId（对象ID）、data（对象数据）、type（对象类型如'line'）

工作流程：
1. 用户请求画线 → 调用 draw_line
2. 然后调用 dispatch_draw_line
3. 画线成功 → 立即调用 save_data 保存
4. 向用户报告结果

对于无法完成的请求，请明确告诉用户：
"抱歉，我无法完成[具体请求]。我只能帮您在3D空间中画线。请告诉我起点和终点坐标，或者起点、方向和距离。"`;

const callModel = async (state: ModelingState) => {
  const messages = [
    {role: "system", content: systemPrompt},
    ...state.messages
  ];
  const response = await llmWithTools.invoke(messages);
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
