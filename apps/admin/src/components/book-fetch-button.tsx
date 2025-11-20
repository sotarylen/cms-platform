// apps/admin/src/lib/book-fetch.service.ts

// 1. 导入您项目中实际的数据库查询函数
import { query } from '@/lib/db';

// 定义与您数据库中 `book_process_status` 字段对应的常量
const PROCESS_STATUS = {
  PENDING: 0,
  COMPLETED: 1,
} as const; // "as const" 确保这些值是字面量类型，增强类型安全

// 1. 定义与 SQL 查询结果完全匹配的类型
interface BookInfoForWorkflow {
  id: number;
  book_process_status: number; // 数据库返回的是 number
  book_url: string;
  book_source: string; // 确保数据库字段名是 book_source
}

/**
 * 根据书籍来源获取对应的 n8n Webhook URL
 * @param source - 书籍来源标识符 (e.g., "JIANGXIAYI")
 * @returns 对应的 Webhook URL
 * @throws 如果没有为该来源配置 Webhook URL，则抛出错误
 */
function getWebhookUrlForSource(source: string): string {
  const sourceKey = source.toUpperCase();
  const webhookUrl = process.env[`N8N_WORKFLOW_${sourceKey}_URL`];

  if (!webhookUrl) {
    const fallbackUrl = process.env.N8N_WORKFLOW_DEFAULT_URL;
    if (fallbackUrl) return fallbackUrl;

    console.error(`N8N Webhook URL for source "${source}" is not configured.`);
    throw new Error(`未配置来源 "${source}" 的抓取工作流。`);
  }

  return webhookUrl;
}

/**
 * 触发 n8n 工作流以抓取指定书籍的章节
 * @param bookId - 需要抓取的书籍 ID
 * @throws 如果书籍不存在、工作流未配置或调用失败，则抛出错误
 */
export async function BookFetchButton(bookId: number): Promise<void> {
  // 2. 【核心修改】使用您的 query 函数执行原生 SQL 查询
  const sql = `
    SELECT id, book_process_status, book_url, book_source
    FROM n8n_book_list 
    WHERE id = ?
  `;
  
  const results = await query<BookInfoForWorkflow[]>(sql, [bookId]);
  const book = results[0];

   // 3. 增加业务逻辑判断
  if (!book) {
    throw new Error(`ID 为 ${bookId} 的书籍不存在于 n8n_book_list 中。`);
  }

//     // 如果任务正在进行或已完成，则不应重复触发
//   if (book.book_process_status === PROCESS_STATUS.COMPLETED) {
//     // 我们可以允许重新抓取已完成的书籍，或者提示用户。
//     // 这里我们选择提示，如果需要重抓，可以移除这个判断。
//     throw new Error(`书籍 #${bookId} 已处理完成，无需重复抓取。`);
//   }

    // 4. 根据来源获取 Webhook URL (逻辑不变)
  const n8nWebhookUrl = getWebhookUrlForSource(book.book_source);
  const n8nApiKey = process.env.N8N_WEBHOOK_API_KEY;

  if (!n8nApiKey) {
    console.error('N8N_WEBHOOK_API_KEY is not configured in .env.local');
    throw new Error('服务集成认证未配置。');
  }

  // 5. 【核心修改】向 n8n 发送更丰富的 payload
  // n8n 工作流现在可以接收到 book_id 和 book_url，这正是它需要的！
  const payload = {
    book_id: book.id,
    book_url: book.book_url,
  };

  const response = await fetch(n8nWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': n8nApiKey,
    },
    body: JSON.stringify(payload), // 发送包含 URL 的新 payload
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`启动抓取过程失败：${errorBody}`);
  }

  // (可选) 触发成功后，您可以在这里更新数据库状态为 'PROCESSING'
  // const updateSql = "UPDATE n8n_book_list SET book_process_status = 'PROCESSING' WHERE book_id = ?";
  // await query(updateSql, [bookId]);

  console.log(`Successfully triggered workflow for book #${bookId} from source "${book.book_source}".`);
}