import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { agent } from '../services/agent';

const router = Router();

// 聊天接口
router.post('/chat', async (req, res) => {
  const { message, userId, conversationId } = req.body;

  try {
    const response = await agent.processMessage(message, userId);

    res.json({
      message: response,
      conversationId: conversationId || uuidv4()
    });
  } catch (error) {
    console.error('聊天错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export { router as chatRouter };