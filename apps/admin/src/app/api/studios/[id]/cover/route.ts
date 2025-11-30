import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { getStudioById, updateStudio } from '@/lib/data/albums';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'studios');

export async function POST(
    request: Request,
    {
        params,
    }: {
        params: Promise<{ id: string }>;
    },
) {
    const resolvedParams = await params;
    const studioId = Number(resolvedParams.id);
    if (!studioId || Number.isNaN(studioId)) {
        return NextResponse.json({ message: '无效的工作室 ID' }, { status: 400 });
    }

    const studio = await getStudioById(studioId);
    if (!studio) {
        return NextResponse.json({ message: '工作室不存在' }, { status: 404 });
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
    const filename = `studio-${studioId}-${Date.now()}${ext}`;

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

    const publicPath = `/uploads/studios/${filename}`;
    await updateStudio(studioId, { studio_cover_url: publicPath });
    revalidatePath(`/albums/studios/${studioId}`);

    return NextResponse.json({ url: publicPath });
}
