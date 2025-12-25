import {Router} from 'express';
import {modelingAgent, userAgent} from "../agents";

const router = Router();

type MessagesType = Array<{
  role: 'user',
  content: string
}>

// 3D建模流式聊天接口
router.post('/chat/stream', async (req, res) => {
  const {message, userId = 'user_123', conversationId = 'default'} = req.body;

  try {
    const messages: MessagesType = [
      {role: 'user', content: message}
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    for await (const event of modelingAgent.chatStream(messages, userId, conversationId)) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('3D建模流式聊天错误:', error);
    res.write(`data: ${JSON.stringify({type: 'error', data: {message: '服务器错误'}})}\n\n`);
    res.end();
  }
});

// 用户管理流式聊天接口
router.post('/user/chat/stream', async (req, res) => {
  const {message, userId = 'user_123', conversationId = 'default'} = req.body;

  try {
    const messages: MessagesType = [
      {role: 'user', content: message}
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    for await (const event of userAgent.chatStream(messages, userId, conversationId)) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('用户管理流式聊天错误:', error);
    res.write(`data: ${JSON.stringify({type: 'error', data: {message: '服务器错误'}})}\n\n`);
    res.end();
  }
});

export {router as chatRouter};
