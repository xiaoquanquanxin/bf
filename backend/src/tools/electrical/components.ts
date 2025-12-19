// 导入 LangChain 工具函数
import { tool } from 'langchain';
// 导入 Zod 数据验证库
import * as z from 'zod';

// 创建电路元件工具
export const createComponentTool = tool(
  ({ type, properties }) => {
    // 生成唯一元件ID
    const componentId = `comp_${Date.now()}`;
    // 输出创建信息
    console.log(`[元件] 创建${type}元件:`, properties);
    // 返回创建结果
    return `已创建${type}电路元件，ID: ${componentId}`;
  },
  {
    // 工具名称
    name: 'create_component',
    // 工具描述
    description: '创建电路元件',
    // 参数验证模式
    schema: z.object({
      // 元件类型
      type: z.string().describe('元件类型：电阻、电容、电感'),
      // 元件属性
      properties: z.object({
        // 电阻值
        resistance: z.string().optional().describe('电阻值'),
        // 电容值
        capacitance: z.string().optional().describe('电容值'),
        // 电感值
        inductance: z.string().optional().describe('电感值'),
        // 额定电压
        voltage: z.string().optional().describe('额定电压'),
        // 额定功率
        power: z.string().optional().describe('额定功率'),
        // 容差
        tolerance: z.string().optional().describe('容差')
      }).describe('元件属性')
    })
  }
);