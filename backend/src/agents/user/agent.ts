import { END, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import * as z from "zod";
import { getUserListTool } from "./tools/getUserListTool";

const State = z.object({
  messages: z.array(z.any()),
});

type UserState = z.infer<typeof State>;

const llm = new ChatOpenAI({
  apiKey: process.env.API_KEY!,
  configuration: { baseURL: process.env.BASE_URL! },
  model: process.env.MODEL_NAME!,
  temperature: 0.1,
});

const tools = {
  get_user_list: getUserListTool,
} as const;

type ToolName = keyof typeof tools;

const llmWithTools = llm.bindTools(Object.values(tools));

const systemPrompt = `你是一个用户管理助手。

你只能执行以下操作：
- 获取用户列表（get_user_list）：显示用户数据，支持分页

功能说明：
- 用户询问"显示用户"、"用户列表"、"查看用户" 等时，调用 get_user_list
- 支持分页参数：page（页码）和 limit（每页数量）
- 默认显示第1页，每页10条数据

对于无法完成的请求，请明确告诉用户：
"抱歉，我只能帮您查看用户列表。请说'显示用户列表'或'查看用户'。"`;

const callModel = async (state: UserState) => {
  const messages = [
    { role: "system", content: systemPrompt },
    ...state.messages
  ];
  const response = await llmWithTools.invoke(messages);
  return {
    messages: [...state.messages, response],
  };
};

const executeTool = async (state: UserState) => {
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

const shouldCallTool = (state: UserState) => {
  const lastMessage = state.messages.at(-1);
  const hasToolCalls = lastMessage.tool_calls && lastMessage.tool_calls.length > 0;
  return hasToolCalls ? "tool" : "end";
};

export const userWorkflow = new StateGraph(State)
  .addNode("model", callModel)
  .addNode("tool", executeTool)
  .addEdge(START, "model")
  .addConditionalEdges("model", shouldCallTool, {
    tool: "tool",
    end: END,
  })
  .addEdge("tool", "model");

export type { UserState };