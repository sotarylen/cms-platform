import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getBookById,
  getChapterContent,
  getChapterNavigation,
  getPhasedSummaries,
  getPlotStages,
} from '@/lib/queries';
import { formatDate } from '@/lib/utils';
import { ChapterContentViewer } from '@/components/chapter-content-viewer';

export default async function ChapterDetail(props: any) {
  const { params } = props;
  const bookId = Number(params.id);
  const chapterId = Number(params.chapterId);

  const [book, chapter, navigation] = await Promise.all([
    getBookById(bookId),
    getChapterContent(chapterId),
    getChapterNavigation(bookId, chapterId),
  ]);

  // 读取书籍级别的聚合数据（用于在章节页显示参考信息）
  const [phases, stages] = await Promise.all([
    getPhasedSummaries(bookId),
    getPlotStages(bookId),
  ]);

  // 仅在存在实质内容（非空字符串或非空数组项）时才显示对应 Block
  const hasPhasesContent = phases && phases.some((p) => p.summary && p.summary.trim() !== '');
  const hasStagesContent = stages && stages.some((s) => s.summary && s.summary.trim() !== '');

  if (!book || !chapter || chapter.bookId !== book.id) {
    notFound();
  }

  const renderNav = (position: 'top' | 'bottom') => (
    <div className="chapter-nav" aria-label={`章节导航-${position}`}>
      <div className="chapter-nav-slot">
        {navigation.prev ? (
          <Link
            className="action-button action-button-primary"
            href={`/books/${book.id}/chapters/${navigation.prev.id}`}
            title={navigation.prev.title}
          >
            ← 上一章
          </Link>
        ) : (
          <span className="action-button action-button-disabled" aria-disabled="true">
            ← 上一章
          </span>
        )}
      </div>
      <div className="chapter-nav-slot">
        <Link className="action-button" href={`/books/${book.id}`}>
          返回目录
        </Link>
      </div>
      <div className="chapter-nav-slot">
        {navigation.next ? (
          <Link
            className="action-button action-button-primary"
            href={`/books/${book.id}/chapters/${navigation.next.id}`}
            title={navigation.next.title}
          >
            下一章 →
          </Link>
        ) : (
          <span className="action-button action-button-disabled" aria-disabled="true">
            下一章 →
          </span>
        )}
      </div>
    </div>
  );

  return (
    <>
      <header className="app-header app-header--compact app-header--reading">
        <div>
          <h1>{book.name}</h1>
          <p className="app-subtitle">正在阅读：{chapter.title}</p>
        </div>
      </header>
      <section className="panel" style={{ marginTop: 8 }}>
        <h2 style={{ marginBottom: 4 }}>{chapter.title}</h2>
        <p className="muted">
          排序：{chapter.sortOrder ?? '—'} · 入库时间：
          {formatDate(chapter.createdAt)}
        </p>
        {chapter.summary && (
          <>
            <h3>章节摘要</h3>
            <p
              style={{
                whiteSpace: 'pre-line',
                color: 'var(--text-muted)',
              }}
            >
              {chapter.summary}
            </p>
          </>
        )}
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        {renderNav('top')}
        <ChapterContentViewer content={chapter.content} />
        {renderNav('bottom')}
      </section>

      {/* 仅在有数据时显示以下书籍级 Block */}
      {hasPhasesContent && (
        <section className="panel">
          <h3>阶段性摘要</h3>
          <div className="timeline">
            {phases
              .filter((phase) => phase.summary && phase.summary.trim() !== '')
              .map((phase) => (
                <article key={phase.id} className="timeline-item">
                  <small>
                    第 {phase.startSort} - {phase.endSort} 章
                  </small>
                  <p style={{ marginTop: 6, whiteSpace: 'pre-line' }}>
                    {phase.summary}
                  </p>
                </article>
              ))}
          </div>
        </section>
      )}
      {hasStagesContent && (
        <section className="panel">
          <h3>剧情阶段 / 战斗节奏</h3>
          <div className="timeline">
            {stages
              .filter((stage) => stage.summary && stage.summary.trim() !== '')
              .map((stage) => (
                <article key={stage.id} className="timeline-item">
                  <small>
                    阶段 {stage.stageNumber} · 第 {stage.startEpisode}-{stage.endEpisode} 集
                  </small>
                  <h4 style={{ margin: '6px 0 4px' }}>{stage.stageName}</h4>
                  <p style={{ whiteSpace: 'pre-line', margin: '0 0 8px' }}>
                    {stage.summary}
                  </p>
                </article>
              ))}
          </div>
        </section>
      )}
      {hasStagesContent && (
        <section className="panel">
          <h3>剧情阶段 / 战斗节奏</h3>
          <div className="timeline">
            {stages
              .filter((stage) => stage.summary && stage.summary.trim() !== '')
              .map((stage) => (
                <article key={stage.id} className="timeline-item">
                  <small>
                    阶段 {stage.stageNumber} · 第 {stage.startEpisode}-{stage.endEpisode} 集
                  </small>
                  <h4 style={{ margin: '6px 0 4px' }}>{stage.stageName}</h4>
                  <p style={{ whiteSpace: 'pre-line', margin: '0 0 8px' }}>
                    {stage.summary}
                  </p>
                </article>
              ))}
          </div>
        </section>
      )}
    </>
  );
}

