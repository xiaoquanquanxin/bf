import { tool } from "langchain";
import { z } from "zod";
import { ToolResult } from "../../../types";
import { sceneStorage } from "../../../utils/sceneStorage";
import { toolContext } from "../../../utils/toolContext";
import { ObjectType } from "../../../types/sceneObject";

/**
 * 列出场景中的所有对象
 */
export const listObjectsTool = tool(
  async (): Promise<ToolResult<any>> => {
    const { userId, conversationId } = toolContext.get('modeling');
    const objects = sceneStorage.getAllObjects(userId, conversationId);

    if (objects.length === 0) {
      return {
        id: 'inventory',
        success: true,
        message: "场景中暂时没有任何对象",
        timestamp: Date.now(),
        data: { objects: [], count: 0 }
      };
    }

    // 格式化对象列表
    const formattedList = objects.map((obj, index) => {
      return `${index + 1}. [${obj.type}] ID: ${obj.id.substring(0, 8)}... (创建于: ${new Date(obj.createdAt).toLocaleString('zh-CN')})`;
    }).join('\n');

    return {
      id: 'inventory',
      success: true,
      message: `场景中共有 ${objects.length} 个对象：\n${formattedList}`,
      timestamp: Date.now(),
      data: { objects, count: objects.length }
    };
  },
  {
    name: "list_objects",
    description: "列出场景中的所有几何对象（点、线、面、体）",
    schema: z.object({})
  }
);

/**
 * 按类型过滤对象
 */
export const filterObjectsByTypeTool = tool(
  async ({ type }: { type: ObjectType }): Promise<ToolResult<any>> => {
    const { userId, conversationId } = toolContext.get('modeling');
    const objects = sceneStorage.filterByType(userId, conversationId, type);

    const typeNames: Record<ObjectType, string> = {
      point: '点',
      line: '线',
      plane: '面',
      volume: '体'
    };

    if (objects.length === 0) {
      return {
        id: 'inventory',
        success: true,
        message: `场景中没有"${typeNames[type]}"类型的对象`,
        timestamp: Date.now(),
        data: { objects: [], count: 0, type }
      };
    }

    const formattedList = objects.map((obj, index) => {
      return `${index + 1}. ID: ${obj.id.substring(0, 8)}... (创建于: ${new Date(obj.createdAt).toLocaleString('zh-CN')})`;
    }).join('\n');

    return {
      id: 'inventory',
      success: true,
      message: `场景中共有 ${objects.length} 个"${typeNames[type]}"对象：\n${formattedList}`,
      timestamp: Date.now(),
      data: { objects, count: objects.length, type }
    };
  },
  {
    name: "filter_objects_by_type",
    description: "按类型过滤场景中的对象。可以筛选：point(点)、line(线)、plane(面)、volume(体)",
    schema: z.object({
      type: z.enum(['point', 'line', 'plane', 'volume']).describe("对象类型")
    })
  }
);

/**
 * 统计对象数量
 */
export const countObjectsTool = tool(
  async (): Promise<ToolResult<any>> => {
    const { userId, conversationId } = toolContext.get('modeling');
    const summary = sceneStorage.countObjects(userId, conversationId);

    const report = `场景对象统计：
━━━━━━━━━━━━━━━━━━━━━━
总计：${summary.totalCount} 个对象

按类型分类：
  • 点 (point):  ${summary.byType.point} 个
  • 线 (line):   ${summary.byType.line} 个
  • 面 (plane):  ${summary.byType.plane} 个
  • 体 (volume): ${summary.byType.volume} 个
━━━━━━━━━━━━━━━━━━━━━━`;

    return {
      id: 'inventory',
      success: true,
      message: report,
      timestamp: Date.now(),
      data: summary
    };
  },
  {
    name: "count_objects",
    description: "统计场景中各类型对象的数量，生成详细报告",
    schema: z.object({})
  }
);

/**
 * 导出清单（JSON 格式）
 */
export const exportInventoryTool = tool(
  async ({ format = 'json' }: { format?: 'json' | 'summary' }): Promise<ToolResult<any>> => {
    const { userId, conversationId } = toolContext.get('modeling');
    const summary = sceneStorage.countObjects(userId, conversationId);

    if (format === 'summary') {
      // 简洁摘要格式
      const summaryText = `场景清单摘要：共 ${summary.totalCount} 个对象 (点:${summary.byType.point}, 线:${summary.byType.line}, 面:${summary.byType.plane}, 体:${summary.byType.volume})`;

      return {
        id: 'inventory',
        success: true,
        message: summaryText,
        timestamp: Date.now(),
        data: { format: 'summary', summary: summaryText }
      };
    }

    // JSON 格式（默认）
    const jsonData = JSON.stringify(summary, null, 2);

    return {
      id: 'inventory',
      success: true,
      message: `已生成 JSON 格式的场景清单（共 ${summary.totalCount} 个对象）`,
      timestamp: Date.now(),
      data: { format: 'json', inventory: summary, jsonString: jsonData }
    };
  },
  {
    name: "export_inventory",
    description: "导出场景清单。支持格式：json(详细JSON数据), summary(简洁摘要)",
    schema: z.object({
      format: z.enum(['json', 'summary']).optional().describe("导出格式，默认为 json")
    })
  }
);
