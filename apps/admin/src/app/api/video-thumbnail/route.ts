import { NextRequest, NextResponse } from 'next/server';
import { getAlbumStoragePath } from '@/lib/config';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const filename = searchParams.get('filename');

    console.log(`Thumbnail request - Album: ${id}, Filename: ${filename}`);

    // 验证参数
    if (!id || !filename) {
        return new NextResponse('Invalid parameters', { status: 400 });
    }

    const albumId = Number(id);
    if (isNaN(albumId)) {
        return new NextResponse('Invalid album ID', { status: 400 });
    }

    const basePath = getAlbumStoragePath();
    const filePath = path.join(basePath, id, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        console.error(`Video file not found: ${filePath}`);
        return new NextResponse('Video not found', { status: 404 });
    }

    // 使用 ffmpeg 提取第一帧
    // ffmpeg -i input.mp4 -ss 00:00:00 -vframes 1 -f image2 pipe:1
    const ffmpeg = spawn('ffmpeg', [
        '-i', filePath,
        '-ss', '00:00:00',
        '-vframes', '1',
        '-f', 'image2',
        '-'
    ]);

    const stream = new ReadableStream({
        start(controller) {
            ffmpeg.stdout.on('data', (chunk) => {
                controller.enqueue(chunk);
            });

            ffmpeg.stdout.on('end', () => {
                controller.close();
            });

            ffmpeg.stderr.on('data', (data) => {
                // console.error(`ffmpeg stderr: ${data}`);
            });

            ffmpeg.on('error', (err) => {
                console.error('Failed to start ffmpeg process:', err);
                controller.error(err);
            });
        },
        cancel() {
            ffmpeg.kill();
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}
