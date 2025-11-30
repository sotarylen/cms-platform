import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { getBookById, updateBookCover } from '@/lib/data/books';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  const resolvedParams = await params;
  const bookId = Number(resolvedParams.id);
  if (!bookId || Number.isNaN(bookId)) {
    return NextResponse.json({ message: '无效的书籍 ID' }, { status: 400 });
  }

  const book = await getBookById(bookId);
  if (!book) {
    return NextResponse.json({ message: '书籍不存在' }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get('cover');

  if (!(file instanceof File)) {
    return NextResponse.json({ message: '请上传封面文件' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { message: '文件过大，限制 5MB 以内' },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || '.png';
  const filename = `book-${bookId}-${Date.now()}${ext}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

  const publicPath = `/uploads/${filename}`;
  await updateBookCover(bookId, publicPath);
  revalidatePath(`/books/${bookId}`);

  return NextResponse.json({ url: publicPath });
}

