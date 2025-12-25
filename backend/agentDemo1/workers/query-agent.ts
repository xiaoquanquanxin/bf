import {createAgent} from "langchain";

export const queryAgent = createAgent({
  model: "claude-sonnet-4",
  tools: [searchDatabase, getUser, queryApi],
  systemPrompt: "你是查询数据的专家。从各种数据源获取信息。"
});
