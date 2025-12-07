import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { getModelById } from '@/lib/data/model-queries';
import { updateModelAction } from '@/app/actions/models';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'models');

export async function POST(
    request: Request,
    {
        params,
    }: {
        params: Promise<{ id: string }>;
    },
) {
    const resolvedParams = await params;
    const modelId = Number(resolvedParams.id);
    if (!modelId || Number.isNaN(modelId)) {
        return NextResponse.json({ message: '无效的模特 ID' }, { status: 400 });
    }

    const model = await getModelById(modelId);
    if (!model) {
        return NextResponse.json({ message: '模特不存在' }, { status: 404 });
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
    const filename = `model-${modelId}-${Date.now()}${ext}`;

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

    const publicPath = `/uploads/models/${filename}`;
    await updateModelAction(modelId, { model_cover_url: publicPath });
    revalidatePath(`/albums/models/${modelId}`);

    return NextResponse.json({ url: publicPath });
}
