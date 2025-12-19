import {tool} from "langchain"; // 导入 LangChain 工具创建函数
import {Vector3} from "three"; // 导入 THREE.js 的 Vector3 类型
import {VertexUtils} from "../../utils"; // 导入顶点工具
import {drawLineSchema} from "../../schemas"; // 导入画线工具的参数验证模式

// 创建画线工具
const drawLineTool = tool(
  (params) => {
    console.log('drawLineTool - params:', params); // 调试输出

    let startPoint: Vector3; // 声明起点变量
    let endPoint: Vector3; // 声明终点变量
    let length: number; // 声明长度变量

    if (params.mode === "byPoints") {
      // 方式1：直接使用终点
      startPoint = VertexUtils.vectorToVector3(params.startPoint); // 转换为 Vector3
      endPoint = VertexUtils.vectorToVector3(params.endPoint); // 转换为 Vector3
      length = startPoint.distanceTo(endPoint); // 使用 THREE.js API 计算距离
    } else if (params.mode === "byVector") {
      // 方式2：根据向量和距离计算终点
      startPoint = VertexUtils.vectorToVector3(params.startPoint); // 转换为 Vector3
      const direction = VertexUtils.vectorToVector3(params.direction).normalize(); // 转换并归一化方向向量
      endPoint = startPoint.clone().add(direction.multiplyScalar(params.distance)); // 计算终点
      length = params.distance; // 长度即为指定距离
    }

    console.log("执行工具-drawLineTool"); // 执行确认输出
    return `已成功画线：从 (${startPoint.x.toFixed(2)}, ${startPoint.y.toFixed(2)}, ${startPoint.z.toFixed(2)}) 到 (${endPoint.x.toFixed(2)}, ${endPoint.y.toFixed(2)}, ${endPoint.z.toFixed(2)})，长度为 ${length.toFixed(2)} 单位`; // 返回执行结果
  },
  {
    name: "draw_line", // 工具名称
    description: "在 3D 空间中画一条线。支持两种方式：(1) 指定起点和终点坐标，或 (2) 指定起点、方向向量和距离", // 工具描述
    schema: drawLineSchema, // 参数验证模式
  }
);

export {drawLineTool}
