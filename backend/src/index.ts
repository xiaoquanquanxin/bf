import 'dotenv/config';
import express from 'express';
import {v4 as uuidv4} from 'uuid';
import {agent} from './services/agent';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 聊天接口
app.post('/api/chat', async (req, res) => {
  const {message, userId, conversationId} = req.body;

  try {
    const response = await agent.processMessage(message, userId);

    res.json({
      message: response,
      conversationId: conversationId || uuidv4()
    });
  } catch (error) {
    console.error('聊天错误:', error);
    res.status(500).json({error: '服务器错误'});
  }
});

app.listen(PORT, () => {
  console.log(`✅ 服务器启动: http://localhost:${PORT}`);
});