import {tool} from "langchain";
import * as z from "zod";
import {compositeAgent} from "../workers/composite-agent";
import {outputAgent} from "../workers/output-agent";
import {chartAgent} from "../workers/chart-agent";
import {queryAgent} from "../workers/query-agent";

// 查询工具
const callQueryAgent = tool(
  async ({request}) => {
    const result = await queryAgent.invoke({
      messages: [{role: "user", content: request}]
    });
    return result.messages[result.messages.length - 1].content;
  },
  {
    name: "query_data",
    description: "查询数据库或 API 获取信息。使用这个当你需要：获取用户数据、查询数据库、调用外部 API",
    schema: z.object({
      request: z.string().describe("具体的查询请求")
    })
  }
);

// 画图工具
const callChartAgent = tool(
  async ({data, chartType}) => {
    const result = await chartAgent.invoke({
      messages: [{
        role: "user",
        content: `将这些数据生成${chartType}:\n${data}`
      }]
    });
    return result.messages[result.messages.length - 1].content;
  },
  {
    name: "create_chart",
    description: "生成数据可视化图表。使用这个当你需要：画柱状图、折线图、饼图等",
    schema: z.object({
      data: z.string().describe("要可视化的数据"),
      chartType: z.enum(["bar", "line", "pie", "scatter"]).describe("图表类型")
    })
  }
);

// 输出信息工具
const callOutputAgent = tool(
  async ({content, format}) => {
    const result = await outputAgent.invoke({
      messages: [{
        role: "user",
        content: `将内容格式化为${format}:\n${content}`
      }]
    });
    return result.messages[result.messages.length - 1].content;
  },
  {
    name: "format_output",
    description: "格式化和输出信息。使用这个当你需要：生成报告、导出 PDF、格式化文本",
    schema: z.object({
      content: z.string().describe("要格式化的内容"),
      format: z.enum(["report", "pdf", "html", "json"]).describe("输出格式")
    })
  }
);

// 组合数据工具
const callCompositeAgent = tool(
  async ({sources, structure}) => {
    const result = await compositeAgent.invoke({
      messages: [{
        role: "user",
        content: `将这些数据源按照这个结构组合:\n源: ${sources}\n结构: ${structure}`
      }]
    });
    return result.messages[result.messages.length - 1].content;
  },
  {
    name: "compose_data",
    description: "组合多个数据源成复杂结构。使用这个当你需要：合并数据、创建嵌套结构、整合多个来源",
    schema: z.object({
      sources: z.string().describe("数据源列表或之前的查询结果"),
      structure: z.string().describe("期望的数据结构描述")
    })
  }
);

const agentTools = [
  callQueryAgent,
  callChartAgent,
  callOutputAgent,
  callCompositeAgent
];

export {agentTools}
