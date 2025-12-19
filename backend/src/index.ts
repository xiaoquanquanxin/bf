// 导入环境变量配置
import 'dotenv/config';
// 导入 Express 框架
import express from 'express';
// 导入聊天路由器
import {chatRouter} from './routers/chatRouter';

// 创建 Express 应用
const app = express();
// 设置端口号
const PORT = process.env.PORT;

// JSON 中间件
app.use(express.json());

// CORS 中间件
app.use((req, res, next) => {
  // 允许所有来源
  res.header('Access-Control-Allow-Origin', '*');
  // 允许的 HTTP 方法
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // 允许的请求头
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 注册聊天路由
app.use('/api', chatRouter);

// 启动服务器
app.listen(PORT, () => {
  // 输出服务器启动信息
  console.log(`✅ 服务器启动: http://localhost:${PORT}`);
  // 输出 API 接口信息
  console.log(`📡 聊天接口: http://localhost:${PORT}/api/chat`);
});
