// 根据当前工作流状态生成系统提示词的函数
export function getSystemPrompt(state: any): string {
  // 从状态中解构出必要的属性
  const { currentStep, selectedOption, options } = state;

  // 如果用户还没有选择选项，返回选项选择阶段的提示词
  if (!selectedOption) {
    // 将选项数组转换为编号列表格式
    const optionsList = options.map((opt: string, idx: number) => `${idx + 1}. ${opt}`).join('\n');
    // 返回选项选择阶段的系统提示词
    return `你是任务助手。

当前状态：等待用户选择选项
- 已选选项：未选择

可选选项：
${optionsList}

用户可以：
1. 说"选项1"、"第一个"等 → 调用 select_option 工具，传入选项名称
2. 说"开始"、"执行" → 调用 start_task 工具
3. 其他无关请求 → 调用 reject_request 工具`;
  }

  // 如果用户已经选择了选项，返回执行确认阶段的提示词
  return `你是任务助手。

当前状态：已准备好执行
- 已选选项：${selectedOption}

用户可以：
1. 确认执行 → 调用 execute_task 工具
2. 修改选项 → 调用 select_option 工具
3. 其他 → 调用 reject_request 工具`;
}
