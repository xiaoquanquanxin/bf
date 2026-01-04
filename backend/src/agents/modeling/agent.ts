import {END, START, StateGraph} from "@langchain/langgraph";
import {ChatOpenAI} from "@langchain/openai";
import * as z from "zod";
import {drawAndDispatchLineTool} from "./tools/drawAndDispatchLineTool";
import {saveDataTool} from "./tools/saveDataTool";
import {
  listObjectsTool,
  filterObjectsByTypeTool,
  countObjectsTool,
  exportInventoryTool
} from "./tools/inventoryTools";

const State = z.object({
  messages: z.array(z.any()),
});

type ModelingState = z.infer<typeof State>;

const llm = new ChatOpenAI({
  apiKey: process.env.API_KEY!,
  configuration: {
    baseURL: process.env.BASE_URL!,
  },
  model: process.env.MODEL_NAME!,
  temperature: 0.1,
});

const tools = {
  draw_and_dispatch_line: drawAndDispatchLineTool,
  list_objects: listObjectsTool,
  filter_objects_by_type: filterObjectsByTypeTool,
  count_objects: countObjectsTool,
  export_inventory: exportInventoryTool,
} as const;

type ToolName = keyof typeof tools;

const llmWithTools = llm.bindTools(Object.values(tools));

const systemPrompt = `你是一个专业的3D几何建模助手。

你可以执行以下操作：

📐 建模工具：
- draw_and_dispatch_line：在3D空间中画线并实时显示给用户
- save_data：保存创建的对象到数据库（通常自动完成）

📋 清单管理工具：
- list_objects：列出场景中的所有几何对象
- filter_objects_by_type：按类型筛选对象（point/line/plane/volume）
- count_objects：统计各类型对象的数量，生成详细报告
- export_inventory：导出场景清单（支持 json 和 summary 格式）

重要规则：
1. 创建几何对象后，对象会自动添加到场景清单，无需手动保存
2. 当用户询问"场景里有什么"、"有多少个对象"等问题时，使用清单工具查询
3. 支持复杂任务，如"画3条线，然后告诉我场景里有多少个对象"

工作流程示例：
- 用户："画一条线" → 调用 draw_and_dispatch_line
- 用户："场景里有什么？" → 调用 list_objects
- 用户："有多少条线？" → 调用 filter_objects_by_type(type='line')
- 用户："统计一下对象" → 调用 count_objects

对于无法完成的请求，请明确告诉用户：
"抱歉，我目前只能帮您创建线条几何对象，以及查询场景清单。"`;


const callModel = async (state: ModelingState) => {
  console.log('🤖 [callModel] 开始调用...');
  const messages = [
    {role: "system", content: systemPrompt},
    ...state.messages
  ];
  console.log('📨 [callModel] 发送消息数量:', messages.length);
  console.log('🚀 [callModel] 调用 llmWithTools.invoke...');

  const response = await llmWithTools.invoke(messages);

  console.log('✅ [callModel] 收到响应');
  console.log('📦 [callModel] Response content:', response.content);
  console.log('🔧 [callModel] Tool calls:', response.tool_calls);

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
