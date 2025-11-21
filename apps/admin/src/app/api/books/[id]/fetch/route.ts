import { NextResponse } from 'next/server';
import { triggerChapterFetch } from '@/lib/book-fetch.service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = Number(params.id);
    
    if (!bookId || isNaN(bookId)) {
      return NextResponse.json(
        { message: '无效的书籍ID' },
        { status: 400 }
      );
    }

    // 检查是否为重新抓取
    const { isRefetch } = await request.json().catch(() => ({}));

    await triggerChapterFetch(bookId, Boolean(isRefetch));

    return NextResponse.json({ 
      success: true, 
      message: '已成功触发章节抓取任务' 
    });
  } catch (error: any) {
    console.error('触发章节抓取失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || '触发章节抓取失败' 
      },
      { status: 500 }
    );
  }
}