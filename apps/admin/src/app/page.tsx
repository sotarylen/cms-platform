import Link from 'next/link';
import { BookSearchForm } from '@/components/book-search-form';
import { PaginationControls } from '@/components/pagination-controls';
import { StatusPill } from '@/components/status-pill';
import TriggerButton from '@/components/trigger-button';
import AnimatedNumber from '@/components/animated-number';
import {
  getBooks,
  getDashboardStats,
  getLatestChapters,
  type BookListResponse,
} from '@/lib/queries';
import { formatDate, formatNumber } from '@/lib/utils';
import BooksTabsWrapper from '@/components/books-tabs-wrapper';

type SearchParams = Record<string, string | string[] | undefined>;

export const dynamic = 'force-dynamic';

const normalizeParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const renderBooksTable = (data: BookListResponse) => {
  if (!data.items.length) {
    return <p className="muted">没有符合条件的书籍。</p>;
  }

  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>书名</th>
            <th>作者</th>
            <th>来源</th>
            <th>最新章节</th>
            <th>章节数</th>
            <th>状态</th>
            <th>操作</th>
            <th>入库时间</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((book) => (
            <tr key={book.id}>
              <td>
                <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>#{book.id}</span>
              </td>
              <td>
                <Link className="table-row-link" href={`/books/${book.id}`}>
                  {book.name}
                </Link>
              </td>
              <td>{book.author ?? '未知'}</td>
              <td>{book.source ?? '—'}</td>
              <td>{book.latestChapter ?? '—'}</td>
              <td>{formatNumber(book.chapterCount)}</td>
              <td>
                <StatusPill status={book.status} />
              </td>
              <td>
                {book.status === 0 ? <TriggerButton bookId={book.id} /> : null}
              </td>
              <td>{formatDate(book.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default async function Home({ searchParams }: any) {
  const resolvedSearchParams = await searchParams;
  const query = normalizeParam(resolvedSearchParams.query) ?? '';
  const source = normalizeParam(resolvedSearchParams.source) ?? '';
  const statusParam = normalizeParam(resolvedSearchParams.status) ?? 'all';
  const minChaptersParam = normalizeParam(resolvedSearchParams.minChapters);
  const maxChaptersParam = normalizeParam(resolvedSearchParams.maxChapters);
  const tabParam = normalizeParam(resolvedSearchParams.tab) ?? 'in-stock';
  const pageParam = normalizeParam(resolvedSearchParams.page);
  const page = pageParam ? Number(pageParam) : 1;

  const [stats, books, latestChapters] = await Promise.all([
    getDashboardStats(),
    getBooks({
      search: query || undefined,
      status: tabParam === 'pending' ? '0' : statusParam || undefined,
      source: source || undefined,
      minChapters: tabParam === 'in-stock' ? 1 : minChaptersParam ? Number(minChaptersParam) : undefined,
      maxChapters: tabParam === 'pending' ? 0 : maxChaptersParam ? Number(maxChaptersParam) : undefined,
      order: tabParam === 'in-stock' ? 'id_desc' : tabParam === 'pending' ? 'id_asc' : 'created_at_desc',
      page,
    }),
    getLatestChapters(5),
  ]);

  return (
    <>
      <section className="panel">
        <h2>数据一览</h2>
        <div className="stats-grid">
          <article className="stat-card stat-books">
            <p className="stat-label">书籍数量</p>
            <p className="stat-value">
              <AnimatedNumber value={stats.books} duration={1000} />
            </p>
          </article>
          <article className="stat-card stat-directory">
            <p className="stat-label">章节目录</p>
            <p className="stat-value">
              <AnimatedNumber value={stats.chapters} duration={1000} />
            </p>
          </article>
          <article className="stat-card stat-contents">
            <p className="stat-label">章节正文</p>
            <p className="stat-value">
              <AnimatedNumber value={stats.contents} duration={1000} />
            </p>
          </article>
          <article className="stat-card stat-scripts">
            <p className="stat-label">剧集脚本</p>
            <p className="stat-value">
              <AnimatedNumber value={stats.scripts} duration={1000} />
            </p>
          </article>
          <article className="stat-card stat-summaries">
            <p className="stat-label">整书摘要</p>
            <p className="stat-value">
              <AnimatedNumber value={stats.summaries} duration={1000} />
            </p>
          </article>
        </div>
      </section>

      {/* <section className="panel">
        <h2>当前最新入库的章节</h2>
        {latestChapters.length === 0 ? (
          <p className="muted">暂无最近入库章节。</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>书籍ID</th>
                <th>书名</th>
                <th>章节名</th>
                <th>入库时间</th>
              </tr>
            </thead>
            <tbody>
              {latestChapters.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>#{item.bookId}</span>
                  </td>
                  <td>
                    <Link className="table-row-link" href={`/books/${item.bookId}`}>
                      {item.bookName ?? '—'}
                    </Link>
                  </td>
                  <td>
                    <Link
                      className="table-row-link"
                      href={`/books/${item.bookId}/chapters/${item.id}`}
                    >
                      {item.chapterTitle ?? '—'}
                    </Link>
                  </td>
                  <td>{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section> */}

      <section className="panel">
        <BookSearchForm query={query} source={source} minChapters={minChaptersParam ?? ''} />
        {/* Client-side Tabs component - handles tab UI and partial fetch */}
        <div style={{ marginTop: 12 }}>
          {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
          {/* Render client component */}
          {/* It will fetch from /api/books and update only this area without full page refresh */}
          {/* Import dynamically to avoid SSR issues */}
          <BooksTabsWrapper
            initialTab={tabParam}
            initialQuery={query}
            initialSource={source}
            initialPage={page}
          />
        </div>
      </section>
    </>
  );
}

