import {tool} from "langchain";
import {z} from "zod";
import {Vector3} from "three";

const point3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

const vector3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

// 方式1：指定起点和终点
const drawLineByPointsSchema = z.object({
  mode: z.literal("byPoints").describe("使用起点和终点坐标的绘制方式"),
  startPoint: point3DSchema.describe("线的起点坐标"),
  endPoint: point3DSchema.describe("线的终点坐标"),
});

// 方式2：指定起点、方向向量和距离
const drawLineByVectorSchema = z.object({
  mode: z.literal("byVector").describe("使用起点、方向向量和距离的绘制方式"),
  startPoint: point3DSchema.describe("线的起点坐标"),
  direction: vector3DSchema.describe("方向向量（会自动归一化）"),
  distance: z.number().positive().describe("线段的长度（单位长度）"),
});

// 合并两种方式
const drawLineSchema = z.discriminatedUnion("mode", [
  drawLineByPointsSchema,
  drawLineByVectorSchema,
]);

const drawLineTool = tool(
  (params) => {
    let startPoint: Vector3
    let endPoint: Vector3
    let length: number

    if (params.mode === "byPoints") {
      // 方式1：直接使用终点
      startPoint = params.startPoint;
      endPoint = params.endPoint;
      const dx = endPoint.x - startPoint.x;
      const dy = endPoint.y - startPoint.y;
      const dz = endPoint.z - startPoint.z;
      length = Math.sqrt(dx * dx + dy * dy + dz * dz);
    } else if (params.mode === "byVector") {
      // 方式2：根据向量和距离计算终点
      startPoint = params.startPoint;
      const {x, y, z} = params.direction;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      // 归一化向量
      const normalizedX = x / magnitude;
      const normalizedY = y / magnitude;
      const normalizedZ = z / magnitude;

      // 计算终点
      endPoint = {
        x: startPoint.x + normalizedX * params.distance,
        y: startPoint.y + normalizedY * params.distance,
        z: startPoint.z + normalizedZ * params.distance,
      };

      length = params.distance;
    }

    console.log("执行工具-drawLineTool");
    return `已成功画线：从 (${startPoint.x.toFixed(2)}, ${startPoint.y.toFixed(2)}, ${startPoint.z.toFixed(2)}) 到 (${endPoint.x.toFixed(2)}, ${endPoint.y.toFixed(2)}, ${endPoint.z.toFixed(2)})，长度为 ${length.toFixed(2)} 单位`;
  },
  {
    name: "draw_line",
    description: "在 3D 空间中画一条线。支持两种方式：(1) 指定起点和终点坐标，或 (2) 指定起点、方向向量和距离",
    schema: drawLineSchema,
  }
);

export {drawLineTool}
