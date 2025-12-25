// Checkpoint = State 的快照，保存到数据库

// 什么被保存：
//   {
//     config: { thread_id: "user_123" },
//     values: { messages: [...], queryResult: {...} },
//     next: ["node_B"],
//       metadata: {...}
//   }

// 特点：
// - 和 thread_id 绑定
// - 多个 checkpoint 可以属于同一个 thread
// - 可以从任何 checkpoint 恢复
