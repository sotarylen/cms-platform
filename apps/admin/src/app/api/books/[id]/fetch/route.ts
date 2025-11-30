import { NextResponse } from 'next/server';
import { triggerChapterFetch } from '@/lib/book-fetch.service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookId = Number(resolvedParams.id);

    if (!bookId || isNaN(bookId)) {
      return NextResponse.json(
        { message: '无效的书籍ID' },
        { status: 400 }
      );
    }

    // 检查是否为重新抓取
    const { isRefetch } = await request.json().catch(() => ({ isRefetch: false }));

    console.log(`触发书籍 ${bookId} 的章节抓取，重新抓取: ${isRefetch}`);

    await triggerChapterFetch(bookId, Boolean(isRefetch));

    return NextResponse.json({
      success: true,
      message: '已成功触发章节抓取任务'
    });
  } catch (error: any) {
    console.error('触发章节抓取失败:', error);

    // 提供更友好的错误信息
    let message = error.message || '触发章节抓取失败';

    // 如果是网络连接问题，给出更具体的建议
    if (message.includes('fetch failed') || message.includes('无法连接到n8n服务')) {
      message += '。请确认：1) n8n服务正在运行；2) Webhook URL正确；3) 网络连接正常。';
    }

    return NextResponse.json(
      {
        success: false,
        message: message
      },
      { status: 500 }
    );
  }
}