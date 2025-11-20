import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookId = Number(id);
    const body = await request.json();

    if (!bookId || isNaN(bookId)) {
      return NextResponse.json(
        { message: '无效的书籍ID' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const updates: string[] = [];
    const values: any[] = [];

    if (body.author !== undefined) {
      updates.push('book_author = ?');
      values.push(body.author || null);
    }
    if (body.source !== undefined) {
      updates.push('book_source = ?');
      values.push(body.source || null);
    }
    if (body.category !== undefined) {
      updates.push('book_catagory = ?');
      values.push(body.category || null);
    }
    if (body.introduce !== undefined) {
      updates.push('book_introduce = ?');
      values.push(body.introduce || null);
    }
    if (body.cover !== undefined) {
      updates.push('book_cover_url = ?');
      values.push(body.cover || null);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: '没有需要更新的字段' },
        { status: 400 }
      );
    }

    values.push(bookId);
    const sql = `UPDATE n8n_book_list SET ${updates.join(', ')} WHERE id = ?`;
    
    await pool.query(sql, values);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('更新书籍失败:', error);
    return NextResponse.json(
      { message: error.message || '更新失败' },
      { status: 500 }
    );
  }
}

