import { tool } from 'langchain';
import * as z from 'zod';

// 几何体工具
export const createGeometryTool = tool(
  ({ type, dimensions }) => {
    const geometryId = `geo_${Date.now()}`;
    console.log(`[几何体] 创建${type}:`, dimensions);
    return `已创建${type}几何体，ID: ${geometryId}`;
  },
  {
    name: 'create_geometry',
    description: '创建3D几何体',
    schema: z.object({
      type: z.string().describe('几何体类型：立方体、球体、圆柱体'),
      dimensions: z.object({
        width: z.number().optional().describe('宽度'),
        height: z.number().optional().describe('高度'),
        depth: z.number().optional().describe('深度'),
        radius: z.number().optional().describe('半径')
      }).describe('尺寸参数')
    })
  }
);