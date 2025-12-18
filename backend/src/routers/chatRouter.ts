// 导入 Express 路由相关类型
import { Router, Request, Response } from 'express';
// 导入 UUID 生成库，用于生成唯一标识符
import { v4 as uuidv4 } from 'uuid';
// 导入 Agent 服务，用于处理聊天逻辑
import { agentService } from '../services/agentService';
// 导入聊天请求类型定义
import { ChatRequest } from '../models/types';

// 创建 Express 路由器实例
const router = Router();

// 定义 POST /chat 路由，处理聊天请求
router.post('/chat', async (req: Request, res: Response) => {
  // 从请求体中获取聊天请求数据
  const request: ChatRequest = req.body;

  // 检查是否为流式请求，目前只支持流式响应
  if (!request.stream) {
    return res.status(501).json({ error: '非流式响应暂未实现' });
  }

  // 设置 Server-Sent Events (SSE) 流式响应的相关头部
  res.setHeader('Content-Type', 'text/event-stream');     // 设置内容类型为事件流
  res.setHeader('Cache-Control', 'no-cache');             // 禁止缓存
  res.setHeader('Connection', 'keep-alive');              // 保持连接活跃
  res.setHeader('Access-Control-Allow-Origin', '*');      // 允许跨域访问
  res.setHeader('X-Accel-Buffering', 'no');               // 禁止 Nginx 缓冲

  try {
    // 生成消息唯一ID
    const messageId = uuidv4();
    // 获取或生成对话ID
    const conversationId = request.conversationId || uuidv4();

    // 发送开始事件，告知前端开始处理
    res.write(`data: ${JSON.stringify({ type: 'start', message_id: messageId, conversation_id: conversationId })}\n\n`);

    // 调用 Agent 服务处理用户消息
    const [response, convId] = await agentService.processMessage(
      request.message,        // 用户消息内容
      request.userId,         // 用户ID
      request.conversationId, // 对话ID
      request.extraInfo       // 额外信息
    );

    // 如果有主要响应消息，则发送给前端
    if (response.mainMessage) {
      res.write(`data: ${JSON.stringify(response)}\n\n`);
    }

    // 发送结束事件，告知前端处理完成
    res.write(`data: ${JSON.stringify({ type: 'end', timestamp: new Date().toISOString(), conversation_id: convId })}\n\n`);
    res.end(); // 结束响应
  } catch (error: any) {
    // 错误处理：记录错误日志并发送错误信息给前端
    console.error('Agent 流式响应失败:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: `Agent 处理失败: ${error.message}` })}\n\n`);
    res.end(); // 结束响应
  }
});

// 导出路由器
export default router;
