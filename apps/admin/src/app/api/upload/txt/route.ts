import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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
    const uploadDir = path.join(process.cwd(), 'uploads', 'txt');
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

    // 读取文件内容用于后续解析
    const content = buffer.toString('utf-8');

    return NextResponse.json({
      success: true,
      filename,
      filepath,
      size: file.size,
      content: content.substring(0, 1000), // 返回前1000个字符用于预览
      contentLength: content.length
    });

  } catch (error: any) {
    console.error('TXT文件上传失败:', error);
    return NextResponse.json(
      { error: '文件上传失败: ' + (error?.message ?? String(error)) },
      { status: 500 }
    );
  }
}