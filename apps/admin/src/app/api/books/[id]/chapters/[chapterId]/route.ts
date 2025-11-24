import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  try {
    const bookId = Number(params.id);
    const chapterId = Number(params.chapterId);
    const body = await request.json();

    if (!bookId || isNaN(bookId)) {
      return NextResponse.json(
        { message: '无效的书籍ID' },
        { status: 400 }
      );
    }

    if (!chapterId || isNaN(chapterId)) {
      return NextResponse.json(
        { message: '无效的章节ID' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const updates: string[] = [];
    const values: any[] = [];

    // 更新章节标题
    if (body.chapter_title !== undefined) {
      updates.push('chapter_title = ?');
      values.push(body.chapter_title || null);
    }

    // 更新章节顺序号
    if (body.chapter_sort !== undefined) {
      updates.push('chapter_sort = ?');
      values.push(body.chapter_sort !== null ? Number(body.chapter_sort) : null);
    }

    if (updates.length === 0) {
      // 即使没有更新任何字段，也返回成功状态
      return NextResponse.json({ success: true });
    }

    values.push(chapterId);
    values.push(bookId); // 确保更新的是正确的书籍下的章节
    
    const sql = `UPDATE n8n_book_chapters_content SET ${updates.join(', ')} WHERE id = ? AND book_id = ?`;
    
    const [result]: any = await pool.query(sql, values);
    
    // 检查是否有行被更新
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: '未找到指定的章节或无权限更新' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('更新章节失败:', error);
    return NextResponse.json(
      { message: error.message || '更新失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  try {
    const bookId = Number(params.id);
    const chapterId = Number(params.chapterId);

    if (!bookId || isNaN(bookId)) {
      return NextResponse.json(
        { message: '无效的书籍ID' },
        { status: 400 }
      );
    }

    if (!chapterId || isNaN(chapterId)) {
      return NextResponse.json(
        { message: '无效的章节ID' },
        { status: 400 }
      );
    }

    const pool = getPool();
    
    // 删除章节
    const sql = `DELETE FROM n8n_book_chapters_content WHERE id = ? AND book_id = ?`;
    const [result]: any = await pool.query(sql, [chapterId, bookId]);
    
    // 检查是否有行被删除
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: '未找到指定的章节或无权限删除' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('删除章节失败:', error);
    return NextResponse.json(
      { message: error.message || '删除失败' },
      { status: 500 }
    );
  }
}