import { NextResponse } from 'next/server';
import {
  getBookById,
  getBookSummary,
  getPhasedSummaries,
  getPlotStages,
} from '@/lib/queries';

const SECTION_LABELS: Record<string, string> = {
  summary: '整书摘要',
  phases: '阶段性摘要',
  stages: '剧情阶段',
};

const formatSummaryText = async (bookId: number) => {
  const book = await getBookById(bookId);
  if (!book) return null;
  const summary = await getBookSummary(bookId);
  const body = summary?.summary ?? '暂无整书摘要。';
  return {
    filename: `${book.name}-整书摘要.txt`,
    text: `《${book.name}》整书摘要\n\n${body}`,
  };
};

const formatPhasesText = async (bookId: number) => {
  const book = await getBookById(bookId);
  if (!book) return null;
  const phases = await getPhasedSummaries(bookId);
  const sections = phases.length
    ? phases
        .map(
          (phase) =>
            `阶段：第 ${phase.startSort} - ${phase.endSort} 章\n${phase.summary ?? '暂无内容'}\n`,
        )
        .join('\n')
    : '暂无阶段性摘要。';
  return {
    filename: `${book.name}-阶段性摘要.txt`,
    text: `《${book.name}》阶段性摘要\n\n${sections}`,
  };
};

const formatStagesText = async (bookId: number) => {
  const book = await getBookById(bookId);
  if (!book) return null;
  const stages = await getPlotStages(bookId);
  const sections = stages.length
    ? stages
        .map((stage) => {
          const lines = [
            `阶段 ${stage.stageNumber}（第 ${stage.startEpisode}-${stage.endEpisode} 集）`,
            `名称：${stage.stageName}`,
            `概述：${stage.summary ?? '暂无概述'}`,
          ];
          if (stage.stageGoal) lines.push(`目标：${stage.stageGoal}`);
          if (stage.conflict) lines.push(`冲突：${stage.conflict}`);
          if (stage.protagonistUpgrade)
            lines.push(`主角成长：${stage.protagonistUpgrade}`);
          return `${lines.join('\n')}\n`;
        })
        .join('\n')
    : '暂无剧情阶段数据。';
  return {
    filename: `${book.name}-剧情阶段.txt`,
    text: `《${book.name}》剧情阶段 / 战斗节奏\n\n${sections}`,
  };
};

const handlerMap: Record<
  string,
  (bookId: number) => Promise<{ filename: string; text: string } | null>
> = {
  summary: formatSummaryText,
  phases: formatPhasesText,
  stages: formatStagesText,
};

export async function GET(_request: Request, context: any) {
  const { params } = context ?? {};
  const bookId = Number(params?.id);
  const section = params?.section;

  if (!handlerMap[section]) {
    return NextResponse.json(
      { message: '不支持的导出类型', section, supported: SECTION_LABELS },
      { status: 400 },
    );
  }

  const payload = await handlerMap[section](bookId);
  if (!payload) {
    return NextResponse.json(
      { message: '未找到目标书籍或内容为空' },
      { status: 404 },
    );
  }

  // Use RFC5987 encoding for non-ASCII filenames and send UTF-8 bytes as body
  const encodedFilename = encodeURIComponent(payload.filename);
  const disposition = `attachment; filename="download.txt"; filename*=UTF-8''${encodedFilename}`;
  const body = new TextEncoder().encode(payload.text);

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': disposition,
    },
  });
}

