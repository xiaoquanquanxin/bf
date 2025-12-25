import {supervisor} from "./supervisor";

async function processUserRequest(userRequest: string) {
  const response = await supervisor.invoke({
    messages: [{
      role: "user",
      content: userRequest
    }]
  });

  // 获取最终结果
  const finalMessage = response.messages[response.messages.length - 1];
  console.log("最终结果:", finalMessage.content);

  return response;
}


const service = async () => {
  // 使用示例：
  // "帮我查询今年的销售数据，生成柱状图，然后输出成 PDF 报告"
  await processUserRequest("帮我查询今年的销售数据，生成柱状图，然后输出成 PDF 报告");
}
