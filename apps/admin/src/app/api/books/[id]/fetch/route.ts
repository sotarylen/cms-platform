// apps/admin/src/app/api/books/[id]/fetch/route.ts

import { NextResponse } from 'next/server';
import { BookFetchButton } from '@/lib/book-fetch.service'; // 我们将在下一步创建这个服务

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  const bookId = parseInt(params.id, 10);

  if (isNaN(bookId)) {
    return NextResponse.json({ message: 'Invalid book ID.' }, { status: 400 });
  }

  try {
    // 调用服务层逻辑来触发 n8n 工作流
    await BookFetchButton(bookId);

    // 返回 202 Accepted，表示请求已接受但仍在处理中
    return NextResponse.json(
      { message: `已成功触发抓取书籍 #${bookId} 章节的任务。` },
      { status: 202 }
    );
  } catch (error) {
    // 记录到服务器日志
    console.error(`[API Error] Failed to trigger fetch for book ${bookId}:`, error);

    // 返回一个通用的错误信息
    return NextResponse.json(
      { message: '启动抓取任务失败，请检查服务器日志。' },
      { status: 500 }
    );
  }
}