import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import jschardet from 'jschardet';
import iconv from 'iconv-lite';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '没有找到上传的文件' }, { status: 400 });
    }

    // 检查文件类型
    if (!file.name.toLowerCase().endsWith('.txt')) {
      return NextResponse.json({ error: '只支持TXT格式文件' }, { status: 400 });
    }

    // 检查文件大小 (限制为10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小不能超过10MB' }, { status: 400 });
    }

    // 创建上传目录
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'books');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const filepath = path.join(uploadDir, filename);

    // 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // 检测文件编码
    let content = '';
    const detected = jschardet.detect(buffer);

    // 如果检测到的编码是 GBK 或 GB2312 等中文编码，使用 iconv-lite 解码
    // 否则默认尝试 UTF-8
    let encoding = detected.encoding;
    if (encoding === 'GB2312' || encoding === 'GBK' || encoding === 'GB18030' || encoding === 'windows-1252') {
      // windows-1252 经常是误判的 GBK
      // 如果检测信心较低，且不是 UTF-8，优先尝试 GBK (针对中文环境)
      if (encoding === 'windows-1252' || !encoding) {
        encoding = 'GB18030';
      }
    }

    try {
      if (encoding && iconv.encodingExists(encoding) && encoding !== 'UTF-8' && encoding !== 'ascii') {
        content = iconv.decode(buffer, encoding);
      } else {
        content = buffer.toString('utf-8');
      }
    } catch (e) {
      console.warn('解码失败，尝试使用 UTF-8 fallback', e);
      content = buffer.toString('utf-8');
    }

    return NextResponse.json({
      success: true,
      filename,
      filepath,
      size: file.size,
      content: content.substring(0, 500), // 返回前500个字符用于预览
      contentLength: content.length,
      detectedEncoding: encoding
    });

  } catch (error: any) {
    console.error('TXT文件上传失败:', error);
    return NextResponse.json(
      { error: '文件上传失败: ' + (error?.message ?? String(error)) },
      { status: 500 }
    );
  }
}