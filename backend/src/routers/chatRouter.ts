import {Router} from 'express';
import {v4 as uuidv4} from 'uuid';
import { modelingAgent, userAgent } from "../agents";

const router = Router();

type MessagesType = Array<{
  role: 'user',
  content: string
}>

// 3D建模聊天接口
router.post('/modeling/chat', async (req, res) => {
  const {message, userId = 'user_123', conversationId = 'default'} = req.body;

  try {
    const messages: MessagesType = [
      {role: 'user', content: message}
    ];

    const response = await modelingAgent.chat(messages, userId, conversationId);

    res.json({
      ...response,
      conversationId
    });
  } catch (error) {
    console.error('3D建模聊天错误:', error);
    res.status(500).json({error: '服务器错误'});
  }
});

// 用户管理聊天接口
router.post('/user/chat', async (req, res) => {
  const {message, userId = 'user_123', conversationId = 'default'} = req.body;

  try {
    const messages: MessagesType = [
      {role: 'user', content: message}
    ];

    const response = await userAgent.chat(messages, userId, conversationId);

    res.json({
      ...response,
      conversationId
    });
  } catch (error) {
    console.error('用户管理聊天错误:', error);
    res.status(500).json({error: '服务器错误'});
  }
});

export {router as chatRouter};