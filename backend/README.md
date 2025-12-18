# Chatbot TypeScript Backend

基于 TypeScript + Node.js + Express 的聊天机器人后端，参考 Python chatbot_app 架构。

## 功能特性

- ✅ 流式响应（SSE）
- ✅ LLM 集成（通义千问）
- ✅ 工具调用（Tool Calling）
- ✅ 多轮对话管理
- ✅ 前端操作指令生成

## 项目结构

```
chatbot-ts/
├── src/
│   ├── models/
│   │   └── types.ts           # 数据类型定义
│   ├── routers/
│   │   └── chatRouter.ts      # 路由处理
│   ├── services/
│   │   ├── agentService.ts    # Agent 服务层
│   │   ├── llmClient.ts       # LLM 客户端
│   │   └── workflow/
│   │       ├── tools.ts       # 工具定义
│   │       └── prompts.ts     # Prompt 模板
│   └── index.ts               # 入口文件
├── package.json
└── tsconfig.json
```

## 安装依赖

```bash
yarn install
```

## 运行

开发模式（热重载）：
```bash
yarn dev
```

构建：
```bash
yarn build
```

生产模式：
```bash
yarn start
```

## API 端点

### POST /api/chat/chat

请求体：
```json
{
  "message": "开始任务",
  "userId": "1",
  "conversationId": "optional-uuid",
  "stream": true,
  "extraInfo": ["选项A", "选项B", "选项C"]
}
```

响应（SSE）：
```
data: {"type":"start","message_id":"...","conversation_id":"..."}

data: {"mainMessage":"好的！请选择一个选项：","frontend_actions":[...]}

data: {"type":"end","timestamp":"...","conversation_id":"..."}
```

## 业务逻辑

简化的任务选择流程：
1. 用户发起任务
2. 选择选项
3. 确认执行
4. 完成任务

## 技术栈

- TypeScript
- Node.js + Express
- OpenAI SDK（兼容通义千问）
- UUID
