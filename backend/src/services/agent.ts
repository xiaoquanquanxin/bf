import { agentClient } from './llmClient';

class Agent {
  async processMessage(message: string, userId: string): Promise<string> {
    const messages = [
      { role: 'user', content: message }
    ];

    return await agentClient.processMessage(messages);
  }
}

export const agent = new Agent();