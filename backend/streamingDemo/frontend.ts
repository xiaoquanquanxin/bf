for await (const block of await agent.stream(
  {messages: [{role: "user", content: "生成销售报告"}]},
  {streamMode: "custom"}
)) {
  // block = { type: "text", content: "..." }
  // block = { type: "table", columns: [...], rows: [...] }
  // block = { type: "image_gallery", images: [...] }

  setBlocks(prev => [...prev, block]);  // 实时渲染
}
