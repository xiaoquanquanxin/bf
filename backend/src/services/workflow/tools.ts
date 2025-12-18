export const tools = [
  {
    type: 'function',
    function: {
      name: 'start_task',
      description: '用户想要开始任务',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'select_option',
      description: '用户选择了一个选项',
      parameters: {
        type: 'object',
        properties: {
          option: {
            type: 'string',
            description: '用户选择的选项名称'
          }
        },
        required: ['option']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'execute_task',
      description: '执行任务',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'reject_request',
      description: '用户请求与任务无关',
      parameters: { type: 'object', properties: {} }
    }
  }
];
