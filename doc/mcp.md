* 部署时的最佳实践
在 LangSmith Deployments 上，推荐的做法是 将 MCP server 作为独立服务部署，而不是与 agent 一起运行：

* 不推荐：在 LangGraph Deployment 内运行 MCP server（仅用于 PoC/演示）
* 推荐：部署独立的 MCP server，agent 通过网络连接访问
* 这样可以更好地管理资源，支持多个 agent 共享同一个 MCP server。
