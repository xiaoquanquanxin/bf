# 聊天应用后端

## 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的配置：
```
API_KEY=your_api_key_here
BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
MODEL_NAME=qwen-plus
PORT=8000
```

## 安装依赖

```bash
npm install
```

## 运行项目

```bash
npm run dev
```

## 注意事项

- 请勿将 `.env` 文件提交到版本控制系统
- 确保 API_KEY 有效且有足够的配额