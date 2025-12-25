import {createAgent} from "langchain";

export const outputAgent = createAgent({
  model: "claude-sonnet-4",
  tools: [formatReport, createPDF],
  systemPrompt: "你是信息输出专家。将数据格式化成清晰的报告。"
});
