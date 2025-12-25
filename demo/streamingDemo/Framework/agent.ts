import z from "zod";
import {createAgent, tool} from "langchain";

// 定义工具
const getWeather = tool(
  async ({city}) => {
    return `The weather in ${city} is sunny, 72°F`;
  },
  {
    name: "get_weather",
    description: "Get weather for a given city",
    schema: z.object({
      city: z.string().describe("The city name"),
    }),
  }
);

// 创建 Agent（LLM 负责推理和工具调用决策）
const agent = createAgent({
  model: "gpt-4o-mini",  // LLM 在这里
  tools: [getWeather],   // Tools 在这里
  systemPrompt: "You are a helpful weather assistant",
});

// 流式执行（Agent Framework 负责流管理）
for await (const chunk of await agent.stream(
  {messages: [{role: "user", content: "What's the weather in SF?"}]},
  {streamMode: "updates"}  // 流模式：更新状态
)) {
  const [step, content] = Object.entries(chunk)[0];
  console.log(`${step}:`, JSON.stringify(content, null, 2));
}
