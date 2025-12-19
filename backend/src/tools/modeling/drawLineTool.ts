import {ToolResult} from "../../types";
// 导入 LangChain 工具创建函数
import {tool} from "langchain";
// 导入 THREE.js 的 Vector3 类型
import {Vector3} from "three";
import {generateUUID} from 'three/src/math/MathUtils'
// 导入顶点工具
import {VertexUtils} from "../../utils";
// 导入画线工具的参数验证模式
import {drawLineSchema} from "../../schemas";
// 导入 Zod 类型推断工具
import {z} from "zod";


// 对应线段的返回
type LineResult = ToolResult<{
  startPoint: { x: number; y: number; z: number };
  endPoint: { x: number; y: number; z: number };
  length: number;
}>;


// 创建画线工具
const drawLineTool = tool(
  (params: z.infer<typeof drawLineSchema>): LineResult => {
    // 声明起点变量
    let startPoint: Vector3;
    // 声明终点变量
    let endPoint: Vector3;
    // 声明长度变量
    let length: number;

    if (params.mode === "byPoints") {
      // 方式1：直接使用终点
      // 转换为 Vector3
      startPoint = VertexUtils.vectorToVector3(params.startPoint);
      // 转换为 Vector3
      endPoint = VertexUtils.vectorToVector3(params.endPoint);
      // 使用 THREE.js API 计算距离
      length = startPoint.distanceTo(endPoint);
    } else if (params.mode === "byVector") {
      // 方式2：根据向量和距离计算终点
      // 转换为 Vector3
      startPoint = VertexUtils.vectorToVector3(params.startPoint);
      // 转换并归一化方向向量
      const direction = VertexUtils.vectorToVector3(params.direction).normalize();
      // 计算终点
      endPoint = startPoint.clone().add(direction.multiplyScalar(params.distance));
      // 长度即为指定距离
      length = params.distance;
    }

    // 执行确认输出
    // console.log("执行工具-drawLineTool");
    // 返回执行结果
    return {
      id: generateUUID(),
      timestamp: Date.now(),
      message: `已成功画线：从 (${startPoint.x.toFixed(2)}, ${startPoint.y.toFixed(2)}, ${startPoint.z.toFixed(2)}) 到 (${endPoint.x.toFixed(2)}, ${endPoint.y.toFixed(2)}, ${endPoint.z.toFixed(2)})，长度为 ${length.toFixed(2)} 单位`,
      success: true,
      data: {
        startPoint,
        endPoint,
        length,
      },
    }
  },
  {
    // 工具名称
    name: "draw_line",
    // 工具描述
    description: "在 3D 空间中画一条线。支持两种方式：(1) 指定起点和终点坐标，或 (2) 指定起点、方向向量和距离",
    // 参数验证模式
    schema: drawLineSchema,
  }
);

export {drawLineTool}
