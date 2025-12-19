// 服务端统一返回这个格式
type ToolResult<T> = {
  success: boolean;
  id: string;           // 该对象在场景中的唯一标识
  data: T;              // 具体的几何数据
  message: string;      // 人类可读的描述
  timestamp: number;
};

export {ToolResult}
