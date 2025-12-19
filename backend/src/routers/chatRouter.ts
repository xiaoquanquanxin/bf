// 导入 Express 路由器
import {Router} from 'express';
// 导入 UUID 生成器
import {v4 as uuidv4} from 'uuid';
// 导入 Agent 服务
import {agent} from '../services/agent';

// 创建路由器实例
const router = Router();

// 聊天接口
router.post('/chat', async (req, res) => {
  // 解构请求参数
  const {message, userId, conversationId} = req.body;

  try {
    // 调用 Agent 处理消息
    const response = await agent.processMessage(message, userId);

    // 返回响应结果
    res.json({
      ...response,
      conversationId: conversationId || uuidv4()
    });
  } catch (error) {
    // 错误日志
    console.error('聊天错误:', error);
    // 返回错误响应
    res.status(500).json({error: '服务器错误'});
  }
});

// 导出聊天路由器
export {router as chatRouter};
