import {createAgent} from "langchain";

export const chartAgent = createAgent({
  model: "claude-sonnet-4",
  tools: [generateChart, savePNG],
  systemPrompt: "你是数据可视化专家。根据数据生成漂亮的图表。"
});
