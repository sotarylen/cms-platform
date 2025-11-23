// apps/admin/src/lib/book-fetch.service.ts
import { getBookById } from '@/lib/queries';
import { query } from '@/lib/db';

/**
 * 触发 n8n 工作流以抓取指定书籍的章节
 * @param bookId - 需要抓取的书籍 ID
 * @param isRefetch - 是否为重新抓取
 * @throws 如果环境变量未配置或调用失败，则抛出错误
 */
export async function triggerChapterFetch(bookId: number, isRefetch: boolean = false): Promise<void> {
  // 如果是重新抓取，先更新数据库状态并删除章节内容
  if (isRefetch) {
    // 1. 将n8n_book_list中对应的书籍id的book_process_status的值设为0
    await query('UPDATE n8n_book_list SET book_process_status = 0 WHERE id = ?', [bookId]);
    
    // 2. 将n8n_book_chapters_content中对应的book_id的所有章节内容删除
    await query('DELETE FROM n8n_book_chapters_content WHERE book_id = ?', [bookId]);
  }

  // 获取书籍来源以确定对应的n8n工作流
  const book = await getBookById(bookId);
  
  if (!book) {
    throw new Error(`Book with ID ${bookId} not found`);
  }

  console.log(`Book details for ID ${bookId}:`, book);

  // 根据书籍来源确定webhook URL
  let n8nWebhookUrl = '';
  
  // 根据书籍来源选择对应的n8n webhook配置
  const source = book.source || ''; // 确保source不为null
  console.log(`Book source: "${source}"`);

  // 添加环境变量调试信息
  // console.log('Available environment variables:');
  // console.log('N8N_CHAPTER_FETCH_WEBHOOK_URL:', process.env.N8N_CHAPTER_FETCH_WEBHOOK_URL);
  // console.log('N8N_CHAPTER_FETCH_WEBHOOK_URL_XCHINA:', process.env.N8N_CHAPTER_FETCH_WEBHOOK_URL_XCHINA);
  // console.log('N8N_CHAPTER_FETCH_WEBHOOK_URL_BOOK18:', process.env.N8N_CHAPTER_FETCH_WEBHOOK_URL_BOOK18);

  // 使用 if-else 替代 switch 语句以更好地处理空字符串情况
  if (source === 'xChina') {
    n8nWebhookUrl = process.env.N8N_CHAPTER_FETCH_WEBHOOK_URL_XCHINA || '';
    console.log('Using xChina webhook configuration');
  } else if (source === 'book18.org') {
    n8nWebhookUrl = process.env.N8N_CHAPTER_FETCH_WEBHOOK_URL_BOOK18 || '';
    console.log('Using book18.org webhook configuration');
  } else {
    // 使用默认配置
    n8nWebhookUrl = process.env.N8N_CHAPTER_FETCH_WEBHOOK_URL || '';
    console.log('Using default webhook configuration');
  }

  console.log(`Webhook URL: "${n8nWebhookUrl}"`);

  // 检查最终配置是否存在
  if (!n8nWebhookUrl) {
    console.error(`N8N Webhook URL is not configured for source: ${source}`);
    throw new Error(`Service integration is not configured for source: ${source}`);
  }

  // 构造发送到 webhook 的数据
  const payload = {
    id: book.id,
    book_source: book.source,
    book_url: book.url,
  };

  const response = await fetch(n8nWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Failed to trigger n8n workflow for book ${bookId}. Status: ${response.status}`, errorBody);
    throw new Error('Failed to start the chapter fetch process.');
  }

  // 更新书籍处理状态为已处理(1)
  await query('UPDATE n8n_book_list SET book_process_status = 1 WHERE id = ?', [bookId]);
  console.log(`Successfully triggered n8n workflow for book ${bookId}.`);
}