import {ToolResult} from "../../../types";
import {Vector3} from "three";
import {VertexUtils} from "../../../utils";
import {tool} from "langchain";
import {generateUUID} from 'three/src/math/MathUtils'
import {drawLineSchema} from "../../../schemas";
import {z} from "zod";
import {wsManager} from "../../../utils/websocket";

type LineResult = ToolResult<{
  startPoint: { x: number; y: number; z: number };
  endPoint: { x: number; y: number; z: number };
  length: number;
}>;

const drawAndDispatchLineTool = tool(
  async (params: z.infer<typeof drawLineSchema>): Promise<LineResult> => {
    let startPoint: Vector3;
    let endPoint: Vector3;
    let length: number;

    // 计算线条数据
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
      throw new Error("Invalid mode");
    }

    // 准备发送给前端的数据
    const lineData = {
      type: 'drawLine',
      startPoint: [startPoint.x, startPoint.y, startPoint.z],
      endPoint: [endPoint.x, endPoint.y, endPoint.z],
      timestamp: Date.now()
    };

    // 通过 WebSocket 发送给前端
    wsManager.broadcast(lineData);

    return {
      id: generateUUID(),
      timestamp: Date.now(),
      message: `已成功画线并发送给 ${wsManager.getClientCount()} 个客户端：从 (${startPoint.x.toFixed(2)}, ${startPoint.y.toFixed(2)}, ${startPoint.z.toFixed(2)}) 到 (${endPoint.x.toFixed(2)}, ${endPoint.y.toFixed(2)}, ${endPoint.z.toFixed(2)})，长度为 ${length.toFixed(2)} 单位`,
      success: true,
      data: {
        startPoint,
        endPoint,
        length,
      },
    }
  },
  {
    name: "draw_and_dispatch_line",
    description: "在 3D 空间中画一条线并实时发送给前端显示。支持两种方式：(1) 指定起点和终点坐标，或 (2) 指定起点、方向向量和距离",
    schema: drawLineSchema,
  }
);

export {drawAndDispatchLineTool}