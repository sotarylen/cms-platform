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
        let filePath = path.join(storagePath, albumId, filename);

        // 如果文件不存在，尝试添加常见扩展名
        const possibleExtensions = ['.webp', '.jpg', '.jpeg', '.png', '.gif'];
        let foundFilePath = filePath;
        
        if (!fs.existsSync(filePath)) {
            const fileNameWithoutExt = path.parse(filename).name;
            for (const ext of possibleExtensions) {
                const testPath = path.join(storagePath, albumId, fileNameWithoutExt + ext);
                if (fs.existsSync(testPath)) {
                    foundFilePath = testPath;
                    console.log('Found file with extension:', testPath);
                    break;
                }
            }
        }

        // 使用找到的文件路径
        filePath = foundFilePath;

        // 安全检查：防止目录遍历攻击
        const normalizedPath = path.normalize(filePath);
        const albumBasePath = path.join(storagePath, albumId);
        if (!normalizedPath.startsWith(albumBasePath)) {
            return new NextResponse('Access denied', { status: 403 });
        }

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            console.log('File not found after extension search:', filePath);
            return new NextResponse('File not found', { status: 404 });
        }

        // 获取文件信息
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;

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
            case '.mov':
                contentType = 'video/quicktime';
                break;
            case '.avi':
                contentType = 'video/x-msvideo';
                break;
            case '.mkv':
                contentType = 'video/x-matroska';
                break;
            case '.flv':
                contentType = 'video/x-flv';
                break;
            case '.wmv':
                contentType = 'video/x-ms-wmv';
                break;
            case '.ogg':
                contentType = 'video/ogg';
                break;
            case '.3gp':
                contentType = 'video/3gpp';
                break;
            case '.m4v':
                contentType = 'video/x-m4v';
                break;
            case '.ts':
                contentType = 'video/mp2t';
                break;
        }

        // 检查是否为视频文件
        const isVideo = contentType.startsWith('video/');

        // 处理 Range 请求（用于视频流式传输和跳转）
        const range = request.headers.get('range');

        if (range && isVideo) {
            // 解析 Range 头
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            // 读取指定范围的文件内容
            const fileStream = fs.createReadStream(filePath, { start, end });
            const chunks: Buffer[] = [];

            for await (const chunk of fileStream) {
                chunks.push(chunk);
            }

            const buffer = Buffer.concat(chunks);

            // 返回部分内容（206 Partial Content）
            return new NextResponse(buffer, {
                status: 206,
                headers: {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize.toString(),
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });
        }

        // 对于非 Range 请求或非视频文件，返回完整文件
        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileSize.toString(),
                'Accept-Ranges': isVideo ? 'bytes' : 'none',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
