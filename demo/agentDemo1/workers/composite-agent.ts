import {createAgent} from "langchain";

export const compositeAgent = createAgent({
  model: "claude-sonnet-4",
  tools: [buildDataStructure, mergeData],
  systemPrompt: "你是数据组合专家。将多个数据源组合成复杂的结构。"
});
