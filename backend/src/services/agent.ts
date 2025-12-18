import { llmClient } from './llmClient';
import { tools } from './workflow/tools';
import { createBasicGeometry, createComponent } from '../tools';

export class Agent {
  private systemPrompt = '你是一个3D建模和电气设计助手，可以帮助用户创建几何体和电路元件。';

  async processMessage(message: string, userId: string): Promise<string> {
    const messages = [
      { role: 'system', content: this.systemPrompt },
      { role: 'user', content: message }
    ];

    const llmResponse = await llmClient.chat(messages, tools);

    // 处理工具调用
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