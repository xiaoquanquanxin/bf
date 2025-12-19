import * as z from "zod";
import {tool} from "langchain";


// 定义 3D 坐标的 Zod 模式
const point3DSchema = z.object({
  x: z.number().describe("X 轴坐标"),
  y: z.number().describe("Y 轴坐标"),
  z: z.number().describe("Z 轴坐标"),
});


// 定义"画线"工具
const drawLineTool = tool(
  ({startPoint, endPoint}) => {
    // 计算线的长度
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const dz = endPoint.z - startPoint.z;
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

    return `已成功画线：从 (${startPoint.x}, ${startPoint.y}, ${startPoint.z}) 到 (${endPoint.x}, ${endPoint.y}, ${endPoint.z})，长度为 ${length.toFixed(2)} 单位`;
  },
  {
    name: "draw_line",
    description: "在 3D 空间中画一条线，指定起点和终点坐标",
    schema: z.object({
      startPoint: point3DSchema.describe("线的起点坐标"),
      endPoint: point3DSchema.describe("线的终点坐标"),
    }),
  }
);

export {drawLineTool}
