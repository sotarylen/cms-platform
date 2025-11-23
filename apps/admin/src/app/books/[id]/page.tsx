import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { StatusPill } from '@/components/status-pill';
import {
  getBookById,
  getBookSummary,
  getChapters,
  getPhasedSummaries,
  getPlotStages,
  getScriptEpisodes,
} from '@/lib/queries';
import { formatDate, formatNumber } from '@/lib/utils';
import { CollapsibleSection } from '@/components/collapsible-section';
import { BookEditButton } from '@/components/book-edit-button';
import dynamic from 'next/dynamic';

const BookFetchButton = dynamic(() => import('@/components/book-fetch-button'));
const BookChaptersSection = dynamic(() => import('@/components/book-chapters-section'));

type PageProps = {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function Page({
  params,
  searchParams = {},
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const bookId = Number(resolvedParams.id);
  const pageParam = Array.isArray(resolvedSearchParams.chapterPage) ? resolvedSearchParams.chapterPage[0] : resolvedSearchParams.chapterPage;
  const chapterPage = pageParam ? Number(pageParam) : 1;

  const [book, summary, chapters, stages, phases, scripts] = await Promise.all([
    getBookById(bookId),
    getBookSummary(bookId),
    getChapters({ bookId, page: chapterPage }),
    getPlotStages(bookId),
    getPhasedSummaries(bookId),
    getScriptEpisodes(bookId),
  ]);

  if (!book) {
    notFound();
  }

  const coverSrc = book.cover ?? '/default-cover.svg';
  const chapterTotalPages = Math.max(1, Math.ceil(chapters.total / chapters.pageSize));

  const hasSummaryContent = !!summary?.summary?.trim();
  const hasPhasesContent = phases && phases.some(p => p.summary?.trim());
  const hasStagesContent = stages && stages.some(s => s.summary?.trim());
  const hasScriptsContent = scripts && scripts.some(sc => sc.title?.trim() || sc.keyPlot?.trim() || sc.range?.trim());

  // 构建章节分页链接
  const buildChapterPageLink = (targetPage: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key === 'chapterPage') return;
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else if (value != null) {
        params.set(key, value);
      }
    });
    params.set('chapterPage', String(targetPage));
    const qs = params.toString();
    return {
      pathname: `/books/${bookId}`,
      search: qs ? `?${qs}` : ''
    };
  };

  // 生成章节分页项
  const chapterPageItems = (() => {
    if (chapterTotalPages <= 7) {
      return Array.from({ length: chapterTotalPages }, (_, index) => ({
        type: 'page' as const,
        value: index + 1,
      }));
    }

    const pagesToInclude = new Set<number>([
      1,
      2,
      chapterTotalPages - 1,
      chapterTotalPages,
    ]);

    for (let offset = -1; offset <= 1; offset += 1) {
      const page = chapterPage + offset;
      if (page > 2 && page < chapterTotalPages - 1) {
        pagesToInclude.add(page);
      }
    }

    const sorted = Array.from(pagesToInclude)
      .filter(page => page >= 1 && page <= chapterTotalPages)
      .sort((a, b) => a - b);

    const items: Array<{ type: 'page'; value: number } | { type: 'ellipsis' }> = [];
    let previous = 0;
    sorted.forEach(page => {
      if (page - previous > 1) {
        items.push({ type: 'ellipsis' });
      }
      items.push({ type: 'page', value: page });
      previous = page;
    });

    return items;
  })();

  return (
    <>
      <div className="panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link className="table-row-link" href="/">
          <i className="fas fa-home"></i> 返回首页
        </Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link className="table-row-link" href="/?status=all">
            <i className="fas fa-book"></i> 查看全部书籍
          </Link>
        </div>
      </div>
      <section className="panel book-hero">
        <div className="book-hero-grid">
          <div>
            <h2 className="book-title">{book.name}</h2>
            <div className="pill-list">
              <span className='pill'>作者：{book.author ?? '未知'}</span>
              <span className="pill">来源：{book.source ?? '—'}</span>
              <span className="pill">分类：{book.category ?? '未分类'}</span>
              <span className="pill">章节：{formatNumber(book.chapterCount)}</span>
              <span className="pill">
                最新章节：{book.latestChapter ?? '未记录'}
              </span>
              <span className="pill">入库：{formatDate(book.createdAt)}</span>
            </div>
            
            <p className='book-intro'>{book.introduce ?? '暂无简介'}</p>
            <div className='book-action-toolbar'>
              <StatusPill status={book.status} />
              <BookEditButton book={book} />
              <BookFetchButton 
                  bookId={book.id} 
                  status={book.status}
                />
            </div>
          </div>
          <div className="book-cover-panel">
            <Image
              src={coverSrc}
              alt={`${book.name} 封面`}
              className="book-cover-image"
              width={200}
              height={300}
              priority
              unoptimized
            />
          </div>
        </div>
      </section>

      <BookChaptersSection bookId={bookId} initialChapters={chapters} />
      
      {hasSummaryContent && (
        <CollapsibleSection
          title="整书摘要"
          subtitle={summary?.totalChapters ? `覆盖 ${summary.totalChapters} 章` : ''}
          defaultOpen={false}
          actions={
            <a className="action-button" href={`/books/${book.id}/export/summary`}>
              导出文本
            </a>
          }
        >
          <p style={{ whiteSpace: 'pre-line' }}>{summary?.summary}</p>
        </CollapsibleSection>
      )}

      {hasPhasesContent && (
        <CollapsibleSection
          title="阶段性摘要"
          subtitle="快速了解主线推进"
          defaultOpen={false}
          actions={
            <a className="action-button" href={`/books/${book.id}/export/phases`}>
              导出文本
            </a>
          }
        >
          <div className="timeline">
            {phases
              .filter((phase) => phase.summary && phase.summary.trim() !== '')
              .map((phase) => (
                <article key={phase.id} className="timeline-item">
                  <small>
                    第 {phase.startSort} - {phase.endSort} 章
                  </small>
                  <p style={{ marginTop: 6, whiteSpace: 'pre-line' }}>{phase.summary}</p>
                </article>
              ))}
          </div>
        </CollapsibleSection>
      )}

      {hasStagesContent && (
        <CollapsibleSection
          title="剧情阶段 / 战斗节奏"
          subtitle="对外宣推或制作改编时的核心素材"
          defaultOpen={false}
          actions={
            <a className="action-button" href={`/books/${book.id}/export/stages`}>
              导出文本
            </a>
          }
        >
          <div className="timeline">
            {stages
              .filter((stage) => stage.summary && stage.summary.trim() !== '')
              .map((stage) => (
                <article key={stage.id} className="timeline-item">
                  <small>
                    阶段 {stage.stageNumber} · 第 {stage.startEpisode}-{stage.endEpisode} 集
                  </small>
                  <h4 style={{ margin: '6px 0 4px' }}>{stage.stageName}</h4>
                  <p style={{ whiteSpace: 'pre-line', margin: '0 0 8px' }}>{stage.summary}</p>
                  <div className="pill-list">
                    {stage.stageGoal && <span className="pill">目标：{stage.stageGoal}</span>}
                    {stage.conflict && <span className="pill">冲突：{stage.conflict}</span>}
                    {stage.protagonistUpgrade && (
                      <span className="pill">主角成长：{stage.protagonistUpgrade}</span>
                    )}
                  </div>
                </article>
              ))}
          </div>
        </CollapsibleSection>
      )}

      {hasScriptsContent && (
        <CollapsibleSection
          title="改编剧本"
          subtitle={`共 ${formatNumber(scripts.length)} 集，按剧集顺序展示`}
          defaultOpen={false}
        >
          <table className="table">
            <thead>
              <tr>
                <th>集数</th>
                <th>标题</th>
                <th>时长</th>
                <th>章节范围</th>
                <th>关键剧情</th>
              </tr>
            </thead>
            <tbody>
              {scripts
                .filter((sc) => (sc.title && sc.title.trim() !== '') || (sc.keyPlot && sc.keyPlot.trim() !== '') || (sc.range && sc.range.trim() !== ''))
                .map((script) => (
                  <tr key={script.id}>
                    <td>第 {script.episode} 集</td>
                    <td>{script.title ?? '未命名'}</td>
                    <td>{script.duration} min</td>
                    <td>{script.range ?? '—'}</td>
                    <td style={{ whiteSpace: 'pre-line' }}>{script.keyPlot ?? '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CollapsibleSection>
      )}
    </>
  );
}

