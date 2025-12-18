import { llmClient } from './llmClient';
import { createBasicGeometry, createComponent } from '../tools';

// 工具定义
const tools = [
  {
    type: 'function',
    function: {
      name: 'create_geometry',
      description: '创建3D几何体',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', description: '几何体类型' },
          dimensions: { type: 'object', description: '尺寸参数' }
        },
        required: ['type', 'dimensions']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_component',
      description: '创建电路元件',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', description: '元件类型' },
          properties: { type: 'object', description: '元件属性' }
        },
        required: ['type', 'properties']
      }
    }
  }
];

class Agent {
  private systemPrompt = '你是一个3D建模和电气设计助手，可以帮助用户创建几何体和电路元件。';

  async processMessage(message: string, userId: string): Promise<string> {
    const messages = [
      { role: 'system', content: this.systemPrompt },
      { role: 'user', content: message }
    ];

    const llmResponse = await llmClient.chat(messages, tools);

    if (llmResponse.tool_calls && llmResponse.tool_calls.length > 0) {
      const toolCall = llmResponse.tool_calls[0];
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments || '{}');

      console.log(`[Agent] 调用工具: ${toolName}`, toolArgs);

      if (toolName === 'create_geometry') {
        const result = createBasicGeometry(toolArgs.type, toolArgs.dimensions);
        return `已创建${toolArgs.type}几何体，ID: ${result.geometryId}`;
      } else if (toolName === 'create_component') {
        const result = createComponent(toolArgs.type, toolArgs.properties);
        return `已创建${toolArgs.type}电路元件，ID: ${result.componentId}`;
      }
    }

    return llmResponse.content || '处理中...';
  }
}

export const agent = new Agent();