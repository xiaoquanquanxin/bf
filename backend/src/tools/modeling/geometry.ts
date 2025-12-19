// 导入 LangChain 工具函数
import { tool } from 'langchain';
// 导入 Zod 数据验证库
import * as z from 'zod';

// 创建几何体工具
export const createGeometryTool = tool(
  ({ type, dimensions }) => {
    // 生成唯一几何体ID
    const geometryId = `geo_${Date.now()}`;
    // 输出创建信息
    console.log(`[几何体] 创建${type}:`, dimensions);
    // 返回创建结果
    return `已创建${type}几何体，ID: ${geometryId}`;
  },
  {
    // 工具名称
    name: 'create_geometry',
    // 工具描述
    description: '创建3D几何体',
    // 参数验证模式
    schema: z.object({
      // 几何体类型
      type: z.string().describe('几何体类型：立方体、球体、圆柱体'),
      // 尺寸参数
      dimensions: z.object({
        // 宽度
        width: z.number().optional().describe('宽度'),
        // 高度
        height: z.number().optional().describe('高度'),
        // 深度
        depth: z.number().optional().describe('深度'),
        // 半径
        radius: z.number().optional().describe('半径')
      }).describe('尺寸参数')
    })
  }
);