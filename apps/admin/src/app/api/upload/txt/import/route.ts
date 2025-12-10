import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { createBook, createChapter } from '@/lib/data/books';

interface ImportData {
  filename: string;
  bookTitle: string;
  author: string;
  category?: string;
  summary: string;
  chapters: {
    title: string;
    content: string;
    sortOrder: number;
  }[];
  cover?: string;
}

export async function POST(req: Request) {
  try {
    const importData: ImportData = await req.json();

    if (!importData.filename || !importData.bookTitle || !importData.chapters?.length) {
      return NextResponse.json({
        error: '缺少必要的导入数据'
      }, { status: 400 });
    }

    // 数据库插入操作
    const result = await saveBookToDatabase(importData);

    // 清理上传的临时文件
    try {
      const filepath = path.join(process.cwd(), 'public', 'uploads', 'books', importData.filename);
      await unlink(filepath);
    } catch (cleanupError) {
      console.warn('清理临时文件失败:', cleanupError);
    }

    return NextResponse.json({
      success: true,
      bookId: result.bookId,
      message: '书籍导入成功'
    });

  } catch (error: any) {
    console.error('书籍导入失败:', error);
    return NextResponse.json(
      { error: '书籍导入失败: ' + (error?.message ?? String(error)) },
      { status: 500 }
    );
  }
}

async function saveBookToDatabase(data: ImportData): Promise<{ bookId: number }> {
  // 1. 创建书籍
  const bookId = await createBook({
    title: data.bookTitle,
    author: data.author,
    category: data.category,
    desc: data.summary,
    cover: data.cover
  });

  // 2. 批量创建章节
  // 注意：为了不阻塞太久，可以使用Promise.all并发处理，或者分批处理
  // 这里章节数量可能较多，为了稳妥起见，我们使用for循环顺序插入，
  // 或者小批量并发。考虑到SQLite/MySQL连接池限制，不宜过大并发。

  const chapters = data.chapters;
  const CHUNK_SIZE = 10;

  for (let i = 0; i < chapters.length; i += CHUNK_SIZE) {
    const chunk = chapters.slice(i, i + CHUNK_SIZE);
    await Promise.all(chunk.map(chapter =>
      createChapter({
        bookId,
        title: chapter.title,
        content: chapter.content,
        sortOrder: chapter.sortOrder
      })
    ));
  }

  return {
    bookId
  };
}