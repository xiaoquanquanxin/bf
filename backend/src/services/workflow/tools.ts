// 定义 LLM 可使用的工具列表，用于函数调用
export const tools = [
  {
    type: 'function',                    // 工具类型：函数
    function: {
      name: 'start_task',              // 工具名称：开始任务
      description: '用户想要开始任务',    // 工具描述，帮助 LLM 理解何时使用
      parameters: { type: 'object', properties: {} } // 参数定义：无参数
    }
  },
  {
    type: 'function',                    // 工具类型：函数
    function: {
      name: 'select_option',           // 工具名称：选择选项
      description: '用户选择了一个选项',   // 工具描述
      parameters: {                    // 参数定义
        type: 'object',                // 参数类型：对象
        properties: {                  // 属性定义
          option: {                    // 选项参数
            type: 'string',            // 参数类型：字符串
            description: '用户选择的选项名称' // 参数描述
          }
        },
        required: ['option']           // 必需参数列表
      }
    }
  },
  {
    type: 'function',                    // 工具类型：函数
    function: {
      name: 'execute_task',            // 工具名称：执行任务
      description: '执行任务',           // 工具描述
      parameters: { type: 'object', properties: {} } // 参数定义：无参数
    }
  },
  {
    type: 'function',                    // 工具类型：函数
    function: {
      name: 'reject_request',          // 工具名称：拒绝请求
      description: '用户请求与任务无关',  // 工具描述
      parameters: { type: 'object', properties: {} } // 参数定义：无参数
    }
  }
];
