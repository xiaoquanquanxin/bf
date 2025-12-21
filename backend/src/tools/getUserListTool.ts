import { tool } from "langchain";
import { z } from "zod";
import { ToolResult } from "../types";

const getUserListSchema = z.object({
  page: z.number().default(1).describe("页码"),
  limit: z.number().default(10).describe("每页数量")
});

export const getUserListTool = tool(
  async (params: z.infer<typeof getUserListSchema>): Promise<ToolResult> => {
    // 模拟用户数据
    const users = [
      { id: 1, name: "张三", email: "zhangsan@example.com", role: "管理员" },
      { id: 2, name: "李四", email: "lisi@example.com", role: "用户" },
      { id: 3, name: "王五", email: "wangwu@example.com", role: "用户" },
      { id: 4, name: "赵六", email: "zhaoliu@example.com", role: "编辑" },
      { id: 5, name: "钱七", email: "qianqi@example.com", role: "用户" }
    ];

    const start = (params.page - 1) * params.limit;
    const end = start + params.limit;
    const pageData = users.slice(start, end);

    return {
      id: `user_list_${Date.now()}`,
      success: true,
      message: `获取到 ${pageData.length} 个用户`,
      timestamp: Date.now(),
      data: {
        users: pageData,
        total: users.length,
        page: params.page,
        limit: params.limit
      }
    };
  },
  {
    name: "get_user_list",
    description: "获取用户列表数据，支持分页",
    schema: getUserListSchema
  }
);