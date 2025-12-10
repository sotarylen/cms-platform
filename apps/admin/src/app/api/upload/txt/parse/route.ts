import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import jschardet from 'jschardet';
import iconv from 'iconv-lite';

interface ParseOptions {
  chapterPattern: string;
  autoGenerateSummary: boolean;
  bookTitle?: string;
  author?: string;
}

interface Chapter {
  title: string;
  content: string;
  sortOrder: number;
}

interface ParseResult {
  bookTitle: string;
  author: string;
  totalChapters: number;
  chapters: Chapter[];
  summary: string;
}

export async function POST(req: Request) {
  try {
    const { filename, options } = await req.json();

    if (!filename) {
      return NextResponse.json({ error: '缺少文件名参数' }, { status: 400 });
    }

    const filepath = path.join(process.cwd(), 'public', 'uploads', 'books', filename);
    const buffer = await readFile(filepath);

    // 检测文件编码
    let content = '';
    const detected = jschardet.detect(buffer);

    let encoding = detected.encoding;
    if (encoding === 'GB2312' || encoding === 'GBK' || encoding === 'GB18030' || encoding === 'windows-1252') {
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

    const parseOptions: ParseOptions = {
      chapterPattern: options?.chapterPattern || '第[0-9一二三四五六七八九十]+章',
      autoGenerateSummary: options?.autoGenerateSummary ?? true,
      bookTitle: options?.bookTitle,
      author: options?.author
    };

    const result = parseTxtContent(content, parseOptions);

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error: any) {
    console.error('文本解析失败:', error);
    return NextResponse.json(
      { error: '文本解析失败: ' + (error?.message ?? String(error)) },
      { status: 500 }
    );
  }
}

function parseTxtContent(content: string, options: ParseOptions): ParseResult {
  const lines = content.split(/\r?\n/);
  const chapters: Chapter[] = [];

  // 智能提取书名和作者
  let bookTitle = options.bookTitle || '';
  let author = options.author || '';

  if (!bookTitle && lines.length > 0) {
    // 尝试从第一行提取书名
    const firstLine = lines[0].trim();
    if (firstLine && !firstLine.match(options.chapterPattern)) {
      bookTitle = firstLine;
    }
  }

  if (!author && lines.length > 1) {
    // 尝试从第二行提取作者
    const secondLine = lines[1].trim();
    const authorMatch = secondLine.match(/作者[：:]\s*(.+)/);
    if (authorMatch) {
      author = authorMatch[1];
    }
  }

  // 章节分割逻辑
  const chapterPattern = new RegExp(options.chapterPattern, 'i');
  let currentChapter: Chapter | null = null;
  let chapterCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 检查是否是章节标题
    if (chapterPattern.test(line)) {
      // 保存上一章节
      if (currentChapter) {
        chapters.push(currentChapter);
      }

      // 开始新章节
      chapterCounter++;
      currentChapter = {
        title: line,
        content: '',
        sortOrder: chapterCounter
      };
    } else if (currentChapter) {
      // 添加内容到当前章节
      currentChapter.content += line + '\n';
    } else if (!bookTitle && line && !line.match(options.chapterPattern)) {
      // 如果还没有书名，且当前行不是章节，则可能是书名
      if (!bookTitle) {
        bookTitle = line;
      }
    }
  }

  // 保存最后一章
  if (currentChapter) {
    chapters.push(currentChapter);
  }

  // 如果没有识别到章节，将整个内容作为第一章
  if (chapters.length === 0) {
    chapters.push({
      title: '第一章',
      content: content,
      sortOrder: 1
    });
  }

  // 生成摘要
  let summary = '';
  if (options.autoGenerateSummary && chapters.length > 0) {
    summary = generateSummary(chapters[0].content);
  }

  // 清理内容
  chapters.forEach(chapter => {
    chapter.content = chapter.content.trim();
  });

  return {
    bookTitle: bookTitle || '未命名书籍',
    author,
    totalChapters: chapters.length,
    chapters,
    summary
  };
}

function generateSummary(content: string): string {
  // 简单的摘要生成：取前200个字符
  const trimmed = content.trim();
  if (trimmed.length <= 200) {
    return trimmed;
  }
  return trimmed.substring(0, 200) + '...';
}