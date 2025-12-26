import {ToolResult} from "../../../types";
import {tool} from "langchain";
import {generateUUID} from "three/src/math/MathUtils";

type LineResult = ToolResult<{
  callList: Array<{
    call: string,
    params: any
  }>
}>;

const dispatchDrawLine = tool(
  (): LineResult => {
    return {
      id: generateUUID(),
      timestamp: Date.now(),
      success: true,
      message: '123456789',
      data: {
        callList: [{call: "123456789", params: undefined}]
      },
    }
  },
  {
    name: "dispatch_draw_line",
    description: "在 3D 空间中画一条线。返回前端的方法列表。",
  }
);

export {dispatchDrawLine}
