import {ToolResult} from "../../../types";
import {Vector3} from "three";
import {VertexUtils} from "../../../utils";
import {tool} from "langchain";
import {generateUUID} from 'three/src/math/MathUtils'
import {drawLineSchema} from "../../../schemas";
import {z} from "zod";

type LineResult = ToolResult<{
  startPoint: { x: number; y: number; z: number };
  endPoint: { x: number; y: number; z: number };
  length: number;
}>;

const drawLineTool = tool(
  (params: z.infer<typeof drawLineSchema>): LineResult => {
    let startPoint: Vector3;
    let endPoint: Vector3;
    let length: number;

    if (params.mode === "byPoints") {
      startPoint = VertexUtils.vectorToVector3(params.startPoint);
      endPoint = VertexUtils.vectorToVector3(params.endPoint);
      length = startPoint.distanceTo(endPoint);
    } else if (params.mode === "byVector") {
      startPoint = VertexUtils.vectorToVector3(params.startPoint);
      const direction = VertexUtils.vectorToVector3(params.direction).normalize();
      endPoint = startPoint.clone().add(direction.multiplyScalar(params.distance));
      length = params.distance;
    } else {
      throw new Error()
    }

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
    name: "draw_line",
    description: "在 3D 空间中画一条线。支持两种方式：(1) 指定起点和终点坐标，或 (2) 指定起点、方向向量和距离",
    schema: drawLineSchema,
  }
);

export {drawLineTool}
