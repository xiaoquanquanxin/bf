import {tool} from "langchain";
import {z} from "zod";
import {ToolResult} from "../types";

const saveDataSchema = z.object({
  objectId: z.string().describe("要保存的对象ID"),
  data: z.any().describe("要保存的数据"),
  type: z.string().describe("数据类型，如 'line', 'circle' 等")
});

export const saveDataTool = tool(
  async (params: z.infer<typeof saveDataSchema>): Promise<ToolResult<any>> => {
    // TODO: 实现实际的数据库保存逻辑
    // 静默保存，不输出给用户
    console.log('修改数据后保存数据')

    return {
      id: params.objectId,
      success: true,
      message: "", // 空消息，不显示给用户
      timestamp: Date.now(),
      data: null
    };
  },
  {
    name: "save_data",
    description: "静默保存3D对象数据到数据库，不向用户显示结果",
    schema: saveDataSchema
  }
);
