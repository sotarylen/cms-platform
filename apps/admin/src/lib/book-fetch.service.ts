// apps/admin/src/lib/book-fetch.service.ts

/**
 * 触发 n8n 工作流以抓取指定书籍的章节
 * @param bookId - 需要抓取的书籍 ID
 * @throws 如果环境变量未配置或调用失败，则抛出错误
 */
export async function triggerChapterFetch(bookId: number): Promise<void> {
  const n8nWebhookUrl = process.env.N8N_CHAPTER_FETCH_WEBHOOK_URL;
  const n8nApiKey = process.env.N8N_WEBHOOK_API_KEY;

  if (!n8nWebhookUrl || !n8nApiKey) {
    console.error('N8N Webhook URL or API Key is not configured in .env.local');
    throw new Error('Service integration is not configured.');
  }

  const response = await fetch(n8nWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': n8nApiKey,
    },
    body: JSON.stringify({ bookId }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Failed to trigger n8n workflow for book ${bookId}. Status: ${response.status}`, errorBody);
    throw new Error('Failed to start the chapter fetch process.');
  }

  console.log(`Successfully triggered n8n workflow for book ${bookId}.`);
}