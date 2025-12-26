import { ToolResult } from '../../../types'
import { Vector3 } from 'three'
import { VertexUtils } from '../../../utils'
import { tool, ToolRuntime } from 'langchain'
import { generateUUID } from 'three/src/math/MathUtils'
import { drawLineSchema } from '../../../schemas'
import { z } from 'zod'
import { wsManager } from '../../../utils/websocket'

// 定义工具返回结果的类型
type LineResult = ToolResult<{
  startPoint: { x: number; y: number; z: number };
  endPoint: { x: number; y: number; z: number };
  length: number;
}>;

// 画线并分发到前端的工具
const drawAndDispatchLineTool = tool(
  async (params: z.infer<typeof drawLineSchema>, runtime: ToolRuntime): Promise<LineResult> => {
    let startPoint: Vector3
    let endPoint: Vector3
    let length: number


    // 根据不同模式计算线条的起点和终点
    if (params.mode === 'byPoints') {
      // 模式1：通过起点和终点坐标
      startPoint = VertexUtils.vectorToVector3(params.startPoint)
      endPoint = VertexUtils.vectorToVector3(params.endPoint)
      length = startPoint.distanceTo(endPoint)
    } else if (params.mode === 'byVector') {
      // 模式2：通过起点、方向向量和距离
      startPoint = VertexUtils.vectorToVector3(params.startPoint)
      const direction = VertexUtils.vectorToVector3(params.direction).normalize()
      endPoint = startPoint.clone().add(direction.multiplyScalar(params.distance))
      length = params.distance
    } else {
      throw new Error('Invalid mode')
    }


    // 准备发送给前端的线条数据
    const lineData = {
      type: 'drawLine',  // 消息类型，前端用来识别
      startPoint: [startPoint.x, startPoint.y, startPoint.z],  // 起点坐标数组
      endPoint: [endPoint.x, endPoint.y, endPoint.z],          // 终点坐标数组
      timestamp: Date.now(),  // 时间戳
    }


    // 通过 WebSocket 实时发送给所有连接的前端客户端

    wsManager.broadcast(lineData)


    // 返回工具执行结果（给 Agent 使用）
    return {
      id: generateUUID(),
      timestamp: Date.now(),
      message: `已成功画线并发送给 ${wsManager.getClientCount()} 个客户端：从 (${startPoint.x.toFixed(2)}, ${startPoint.y.toFixed(2)}, ${startPoint.z.toFixed(2)}) 到 (${endPoint.x.toFixed(2)}, ${endPoint.y.toFixed(2)}, ${endPoint.z.toFixed(2)})，长度为 ${length.toFixed(2)} 单位`,
      success: true,
      data: {
        startPoint,  // 返回计算后的起点
        endPoint,    // 返回计算后的终点
        length,      // 返回线条长度
      },
    }
  },
  {
    name: 'draw_and_dispatch_line',
    description: '在 3D 空间中画一条线并实时发送给前端显示。支持两种方式：(1) 指定起点和终点坐标，或 (2) 指定起点、方向向量和距离',
    schema: drawLineSchema,  // 使用预定义的参数验证模式
  },
)

export { drawAndDispatchLineTool }
