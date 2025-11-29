import { getBookById } from '@/lib/queries';
import { query } from '@/lib/db';
import { getWebhookById } from '@/lib/config';

/**
 * 触发 n8n 工作流以抓取指定书籍的章节
 * @param bookId - 需要抓取的书籍 ID
 * @param isRefetch - 是否为重新抓取
 * @throws 如果配置未找到或调用失败，则抛出错误
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
    throw new Error(`找不到ID为 ${bookId} 的书籍`);
  }

  console.log(`Book details for ID ${bookId}:`, book);

  // 根据书籍来源确定webhook配置ID
  let webhookId = 'chapter-fetch-default';
  const source = book.source || '';

  if (source === 'xChina') {
    webhookId = 'chapter-fetch-xchina';
  } else if (source === 'book18.org') {
    webhookId = 'chapter-fetch-book18';
  }

  // 获取Webhook配置
  const webhook = getWebhookById(webhookId);

  if (!webhook || !webhook.url) {
    // 尝试回退到默认配置
    if (webhookId !== 'chapter-fetch-default') {
      console.log(`Webhook config '${webhookId}' not found, trying default...`);
      const defaultWebhook = getWebhookById('chapter-fetch-default');
      if (defaultWebhook && defaultWebhook.url) {
        // 使用默认配置继续
        return executeWebhook(defaultWebhook, book);
      }
    }

    const errorMsg = `未配置书籍来源 "${source}" 的Webhook接口，请在后台"n8n接口管理"中配置 ID 为 "${webhookId}" 的接口`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  await executeWebhook(webhook, book);
}

async function executeWebhook(webhook: any, book: any) {
  console.log(`Using webhook: ${webhook.title} (${webhook.url})`);

  // 构造发送到 webhook 的数据
  const payload = {
    id: book.id,
    book_source: book.source,
    book_url: book.url,
  };

  let response: Response;
  try {
    // 测试连接
    const url = new URL(webhook.url);
    console.log(`Testing connection to ${url.origin}`);

    // 先测试主机是否可达
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    const testResponse = await fetch(url.origin, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    console.log(`Host ${url.origin} is reachable, status: ${testResponse.status}`);

    // 准备请求头
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 如果有API Key，添加到请求头
    if (webhook.apiKey) {
      headers['Authorization'] = `Bearer ${webhook.apiKey}`;
    }

    // 发送实际请求
    response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      const errorMsg = '连接n8n服务超时，请检查服务是否正在运行以及网络连接';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const errorMsg = `无法连接到n8n服务，请检查网络连接和服务状态: ${error.message || error}`;
    console.error(errorMsg, error);
    throw new Error(errorMsg);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    const errorMsg = `n8n工作流调用失败，状态码: ${response.status}，响应内容: ${errorBody}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // 更新书籍处理状态为已处理(1)
  await query('UPDATE n8n_book_list SET book_process_status = 1 WHERE id = ?', [book.id]);
  console.log(`Successfully triggered n8n workflow for book ${book.id}.`);
}