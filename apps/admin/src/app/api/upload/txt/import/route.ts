import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

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

    // 模拟数据库插入操作
    // 在实际项目中，这里应该连接到真实的数据库
    const result = await saveBookToDatabase(importData);

    // 清理上传的临时文件
    try {
      const filepath = path.join(process.cwd(), 'uploads', 'txt', importData.filename);
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
  // 这里应该实现真实的数据库操作
  // 为了演示，我们模拟插入操作并返回模拟的ID
  
  console.log('正在保存书籍到数据库...', {
    title: data.bookTitle,
    author: data.author,
    chapterCount: data.chapters.length
  });

  // 模拟数据库延迟
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 在实际项目中，这里应该：
  // 1. 插入书籍记录到books表
  // 2. 插入章节记录到chapters表
  // 3. 返回插入的书籍ID
  
  const mockBookId = Math.floor(Math.random() * 10000) + 1000;
  
  return {
    bookId: mockBookId
  };
}