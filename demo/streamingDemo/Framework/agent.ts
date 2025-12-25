import z from "zod";
import {createAgent, tool} from "langchain";

// 1. 定义工具
const getWeather = tool(
  async ({city}) => {
    return `The weather in ${city} is always sunny!`;
  },
  {
    name: "get_weather",
    description: "Get weather for a given city.",
    schema: z.object({
      city: z.string(),
    }),
  }
);

const searchNews = tool(
  async ({topic}) => {
    return `Latest news about ${topic}: AI advances continue...`;
  },
  {
    name: "search_news",
    description: "Search for news on a topic.",
    schema: z.object({
      topic: z.string().describe("The topic to search for"),
    }),
  }
);

// 2. 创建 agent
const agent = createAgent({
  model: "gpt-4o-mini",
  tools: [getWeather, searchNews],
});

// 3. 流式执行 agent
async function runAgent() {
  for await (const chunk of await agent.stream(
    {
      messages: [
        {
          role: "user",
          content: "什么时候在旧金山的天气? 顺便搜索一下AI新闻",
        },
      ],
    },
    {streamMode: "updates"} // 返回每个步骤的更新
  )) {
    // chunk 是一个对象，key 是步骤名称（如 "model"、"tools"）
    const [step, content] = Object.entries(chunk)[0];
    const latestMessage = content.messages?.[0];

    // 如果是模型输出
    if (latestMessage?.kwargs?.tool_calls) {
      const toolNames = latestMessage.kwargs.tool_calls.map(
        (tc: any) => tc.name
      );
      console.log(`📞 正在调用工具: ${toolNames.join(", ")}`);
    }

    // 如果是最终回复
    if (latestMessage?.kwargs?.content) {
      console.log(`🤖 Agent: ${latestMessage.kwargs.content}`);
    }
  }
}

runAgent();
