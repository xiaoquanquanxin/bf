import { tool } from 'langchain';
import * as z from 'zod';

// 电路元件工具
export const createComponentTool = tool(
  ({ type, properties }) => {
    const componentId = `comp_${Date.now()}`;
    console.log(`[元件] 创建${type}元件:`, properties);
    return `已创建${type}电路元件，ID: ${componentId}`;
  },
  {
    name: 'create_component',
    description: '创建电路元件',
    schema: z.object({
      type: z.string().describe('元件类型：电阻、电容、电感'),
      properties: z.object({
        resistance: z.string().optional().describe('电阻值'),
        capacitance: z.string().optional().describe('电容值'),
        inductance: z.string().optional().describe('电感值'),
        voltage: z.string().optional().describe('额定电压'),
        power: z.string().optional().describe('额定功率'),
        tolerance: z.string().optional().describe('容差')
      }).describe('元件属性')
    })
  }
);