import 'dotenv/config';
import express from 'express';
import { chatRouter } from './routers/chatRouter';

const app = express();
const PORT = process.env.PORT || 8000;

// 中间件
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

// 路由注册
app.use('/api', chatRouter);

// 启动服务器
app.listen(PORT, () => {
  console.log(`✅ 服务器启动: http://localhost:${PORT}`);
  console.log(`📡 聊天接口: http://localhost:${PORT}/api/chat`);
});