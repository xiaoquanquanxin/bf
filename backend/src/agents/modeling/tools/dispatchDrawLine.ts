import {ToolResult} from "../../../types";
import {tool} from "langchain";
import {generateUUID} from "three/src/math/MathUtils";
import {wsManager} from "../../../utils/websocket";

type LineResult = ToolResult<null>;

const dispatchDrawLine = tool(
  (args: { startPoint: [number, number, number], endPoint: [number, number, number] }): LineResult => {
    const lineData = {
      type: 'drawLine',
      startPoint: args.startPoint,
      endPoint: args.endPoint,
      timestamp: Date.now()
    };

    // 通过 WebSocket 发送给前端
    wsManager.broadcast(lineData);

    return {
      id: generateUUID(),
      timestamp: Date.now(),
      success: true,
      message: `线条已发送给 ${wsManager.getClientCount()} 个客户端`,
      data: null
    }
  },
  {
    name: "dispatch_draw_line",
    description: "在 3D 空间中画一条线。返回前端的方法列表。",
  }
);

export {dispatchDrawLine}
