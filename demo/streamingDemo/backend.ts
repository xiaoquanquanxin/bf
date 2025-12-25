import {LangGraphRunnableConfig} from "@langchain/langgraph";
import { tool } from "langchain";

// Tool 使用 config.writer 流式发送
const getMenuSalesReport = tool(
  async (input, config: LangGraphRunnableConfig) => {
    // 块 1: 文本
    config.writer?.({
      type: "text",
      content: "正在生成菜品销售报告..."
    });

    // 块 2: 表格（等待数据库查询）
    const tableData = await queryDatabase();
    config.writer?.({
      type: "table",
      columns: [...],
      rows: tableData
    });

    // 块 3: 图片面板
    const images = await fetchImages();
    config.writer?.({
      type: "image_gallery",
      images: images
    });

    return "报告生成完成";  // Tool 本身返回简短的总结
  },
  {
    name: "get_menu_sales_report",
    description: "生成菜品销售报告",
    schema: z.object({ /* ... */ })
  }
);
