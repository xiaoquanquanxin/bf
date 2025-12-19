import {z} from "zod";

// 定义 3D 点坐标的 Zod 验证模式
export const point3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

// 定义 3D 向量的 Zod 验证模式
export const vector3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

// 方式1：指定起点和终点的参数模式
export const drawLineByPointsSchema = z.object({
  mode: z.literal("byPoints").describe("使用起点和终点坐标的绘制方式"),
  startPoint: point3DSchema.describe("线的起点坐标"),
  endPoint: point3DSchema.describe("线的终点坐标"),
});

// 方式2：指定起点、方向向量和距离的参数模式
export const drawLineByVectorSchema = z.object({
  mode: z.literal("byVector").describe("使用起点、方向向量和距离的绘制方式"),
  startPoint: point3DSchema.describe("线的起点坐标"),
  direction: vector3DSchema.describe("方向向量（会自动归一化）"),
  distance: z.number().positive().describe("线段的长度（单位长度）"),
});

// 合并两种绘制方式的联合模式
export const drawLineSchema = z.discriminatedUnion("mode", [
  drawLineByPointsSchema,
  drawLineByVectorSchema,
]);
