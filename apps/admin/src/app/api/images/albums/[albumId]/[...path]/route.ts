import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAlbumStoragePath } from '@/lib/config';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ albumId: string; path: string[] }> }
) {
    try {
        const resolvedParams = await params;
        const { albumId, path: pathSegments } = resolvedParams;

        // 将路径段数组连接成完整路径
        const filename = pathSegments.join('/');

        // 获取存储路径
        const storagePath = getAlbumStoragePath();
        const filePath = path.join(storagePath, albumId, filename);

        // 安全检查：防止目录遍历攻击
        const normalizedPath = path.normalize(filePath);
        const albumBasePath = path.join(storagePath, albumId);
        if (!normalizedPath.startsWith(albumBasePath)) {
            return new NextResponse('Access denied', { status: 403 });
        }

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        // 读取文件
        const fileBuffer = fs.readFileSync(filePath);

        // 确定 Content-Type
        const ext = path.extname(filename).toLowerCase();
        let contentType = 'application/octet-stream';

        switch (ext) {
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
            case '.webp':
                contentType = 'image/webp';
                break;
            case '.svg':
                contentType = 'image/svg+xml';
                break;
            case '.mp4':
                contentType = 'video/mp4';
                break;
            case '.webm':
                contentType = 'video/webm';
                break;
        }

        // 返回文件内容
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error serving image:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
