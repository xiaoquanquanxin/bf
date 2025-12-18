// 导入 Express 框架
import express from 'express';
// 导入聊天路由模块
import chatRouter from './routers/chatRouter';

// 创建 Express 应用实例
const app = express();
// 定义服务器端口号
const PORT = 8001;

// 配置中间件：解析 JSON 请求体
app.use(express.json());

// 配置 CORS 跨域中间件
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');                    // 允许所有域名访问
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // 允许的 HTTP 方法
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');     // 允许的请求头
  if (req.method === 'OPTIONS') {                                   // 处理预检请求
    return res.sendStatus(200);                                     // 返回 200 状态码
  }
  next();                                                           // 继续执行下一个中间件
});

// 注册聊天相关的路由，所有 /api/chat 开头的请求都会被 chatRouter 处理
app.use('/api/chat', chatRouter);

// 启动服务器并监听指定端口
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);        // 输出服务器启动信息
  console.log(`📡 Chat endpoint: http://localhost:${PORT}/api/chat/chat`); // 输出聊天接口地址
});
