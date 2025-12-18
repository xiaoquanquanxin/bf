# 3D 建模助手 - 前端

基于 React + TypeScript + Three.js 的 3D 建模助手前端应用。

## 功能特性

- 🎨 3D 场景渲染 (Three.js + React Three Fiber)
- 💬 实时聊天界面
- 🔄 流式响应支持
- 🎯 前端操作执行
- 📱 响应式设计

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Three.js** - 3D 渲染
- **@react-three/fiber** - React Three.js 集成
- **@react-three/drei** - Three.js 工具库

## 快速开始

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm start
```

3. 打开浏览器访问 http://localhost:3000

## 项目结构

```
src/
├── components/          # React 组件
│   ├── Scene3D.tsx     # 3D 场景组件
│   └── ChatPanel.tsx   # 聊天面板组件
├── services/           # 服务层
│   └── chatService.ts  # 聊天服务
├── types/              # TypeScript 类型定义
│   └── index.ts
├── App.tsx             # 主应用组件
└── index.tsx           # 应用入口
```

## 与后端通信

前端通过 Server-Sent Events (SSE) 与后端进行实时通信：

- 发送聊天消息到 `/api/chat/chat`
- 接收流式响应和前端操作指令
- 支持对话状态管理

## 开发说明

- 确保后端服务运行在 http://localhost:8000
- 前端默认运行在 http://localhost:3000
- 支持热重载开发