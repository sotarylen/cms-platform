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

type PageProps = {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

const normalizeParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function BookDetail({
  params,
  searchParams = {},
}: PageProps) {
  const bookId = Number(params.id);
  const pageParam = normalizeParam(searchParams.chapterPage);
  const chapterPage = pageParam ? Number(pageParam) : 1;

  // 重新获取书籍信息，确保显示的是最新数据
  const refreshBook = async () => {
    const [book] = await Promise.all([
      getBookById(bookId),
    ]);
    return book;
  };

  const [book, summary, chapters, stages, phases, scripts] = await Promise.all([
    refreshBook(),
    getBookSummary(bookId),
    getChapters({ bookId, page: chapterPage }),
    getPlotStages(bookId),
    getPhasedSummaries(bookId),
    getScriptEpisodes(bookId),
  ]);

  if (!book) {
    notFound();
  }

  const hasSummaryContent = !!summary && !!summary.summary && summary.summary.trim() !== '';
  const hasPhasesContent = phases && phases.some((p) => p.summary && p.summary.trim() !== '');
  const hasStagesContent = stages && stages.some((s) => s.summary && s.summary.trim() !== '');
  const hasScriptsContent = scripts && scripts.some((sc) => (sc.title && sc.title.trim() !== '') || (sc.keyPlot && sc.keyPlot.trim() !== '') || (sc.range && sc.range.trim() !== ''));

  const coverSrc = book.cover ? book.cover : '/default-cover.svg';

  const buildChapterPageLink = (targetPage: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key === 'chapterPage') {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value != null) {
        params.set(key, value);
      }
    });
    params.set('chapterPage', String(targetPage));
    const qs = params.toString();
    return {
      pathname: `/books/${bookId}`,
      query: Object.fromEntries(params.entries())
    };
  };

  const chapterTotalPages = Math.max(
    1,
    Math.ceil(chapters.total / chapters.pageSize),
  );

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
      .filter((page) => page >= 1 && page <= chapterTotalPages)
      .sort((a, b) => a - b);

    const items: Array<{ type: 'page'; value: number } | { type: 'ellipsis' }> =
      [];

    let previous = 0;
    sorted.forEach((page) => {
      if (page - previous > 1) {
        items.push({ type: 'ellipsis' });
      }
      items.push({ type: 'page', value: page });
      previous = page;
    });

    return items;
  })();

  // 检查是否有内容显示
  const hasSummaryContent = !!summary && !!summary.summary && summary.summary.trim() !== '';
  const hasPhasesContent = phases.some((phase) => phase.summary && phase.summary.trim() !== '');
  const hasStagesContent = stages.some((stage) => stage.summary && stage.summary.trim() !== '');
  const hasScriptsContent = scripts.length > 0;

  const handleFetchClick = async () => {
    'use server';
    await import('@/components/book-fetch-button').then(m => m.BookFetchButton(bookId));
  };

  return (
    <>
      <div className="panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link className="table-row-link" href="/">
          ← 返回首页
        </Link>
        <Link className="table-row-link" href="/?status=all">
          查看全部书籍
        </Link>
      </div>
      <section className="panel book-hero">
        <div className="book-hero-grid">
          <div>
            <h2 className="book-title">{book.name}</h2>
            <p className="muted">
              作者：{book.author ?? '未知'} · 来源：{book.source ?? '—'}
            </p>
            <div style={{ margin: '12px 0' }}>
              <StatusPill status={book.status} />
            </div>
            <p>{book.introduce ?? '暂无简介'}</p>
            <div className="pill-list">
              <span className="pill">分类：{book.category ?? '未分类'}</span>
              <span className="pill">章节：{formatNumber(book.chapterCount)}</span>
              <span className="pill">
                最新章节：{book.latestChapter ?? '未记录'}
              </span>
              <span className="pill">入库：{formatDate(book.createdAt)}</span>
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
            <form
              className="cover-upload-form"
              action={`/books/${book.id}/cover`}
              method="post"
              encType="multipart/form-data"
              style={{ display: 'flex', flexDirection: 'row', gap: 8 }}
            >
              <label className="cover-upload-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input type="file" name="cover" accept="image/*" required style={{ display: 'none' }} />
              </label>
              <button type="submit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </section>

      <CollapsibleSection
        title="章节目录"
        subtitle={`共 ${formatNumber(
          chapters.total,
        )} 条（源自 n8n_book_chapters_content），点击章节进入正文`}
        defaultOpen
      >
        {chapters.items.length ? (
          <>
            <div className="chapter-grid">
              {chapters.items.map((chapter) => (
                <article key={chapter.id} className="chapter-card">
                  <small>第 {chapter.sortOrder ?? '—'} 章</small>
                  <Link href={`/books/${book.id}/chapters/${chapter.id}`}>
                    {chapter.title}
                  </Link>
                </article>
              ))}
            </div>
            <div className="chapter-pagination">
              <Link
                className="page-link"
                href={buildChapterPageLink(Math.max(1, chapterPage - 1))}
                aria-disabled={chapterPage <= 1}
              >
                «
              </Link>
              {chapterPageItems.map((item, index) =>
                item.type === 'ellipsis' ? (
                  <span key={`ellipsis-${index}`} className="page-link" aria-disabled="true">
                    …
                  </span>
                ) : (
                  <Link
                    key={item.value}
                    className="page-link"
                    href={buildChapterPageLink(item.value)}
                    data-active={item.value === chapterPage}
                  >
                    {item.value}
                  </Link>
                ),
              )}
              <Link
                className="page-link"
                href={buildChapterPageLink(
                  Math.min(chapterTotalPages, chapterPage + 1),
                )}
                aria-disabled={chapterPage >= chapterTotalPages}
              >
                »
              </Link>
            </div>
          </>
        ) : (
          <p className="muted">暂无章节列表。</p>
        )}
      </CollapsibleSection>

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

