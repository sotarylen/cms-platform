"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import TriggerButton from '@/components/trigger-button';
import { StatusPill } from '@/components/status-pill';
import { formatDate, formatNumber } from '@/lib/utils';

type BookItem = {
  id: number;
  name: string;
  author: string | null;
  source: string | null;
  latestChapter: string | null;
  status: number | null;
  createdAt: string; // ISO
  chapterCount: number;
};

export default function BooksTabs({
  initialTab = 'in-stock',
  initialQuery = '',
  initialSource = '',
  initialPage = 1,
}: {
  initialTab?: string;
  initialQuery?: string;
  initialSource?: string;
  initialPage?: number;
}) {
  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState(initialQuery);
  const [source, setSource] = useState(initialSource);
  const [page, setPage] = useState(initialPage);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<BookItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(30);

  const fetchList = async (opts?: { tab?: string; query?: string; source?: string; page?: number }) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      p.set('tab', opts?.tab ?? tab);
      if ((opts?.query ?? query) !== '') p.set('query', opts?.query ?? query);
      if ((opts?.source ?? source) !== '') p.set('source', opts?.source ?? source);
      p.set('page', String(opts?.page ?? page));

      const res = await fetch(`/api/books?${p.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      setItems(json.items ?? []);
      setTotal(json.total ?? 0);
      setPageSize(json.pageSize ?? 30);
      setPage(json.page ?? 1);
    } catch (err) {
      console.error('fetch books failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList({ tab, query, source, page });
    // keep the page scrolled to the component position: browser won't navigate, so page stays
  }, []);

  const onSwitch = (next: string) => {
    if (next === tab) return;
    setTab(next);
    // reset to first page when switching
    fetchList({ tab: next, query, source, page: 1 });
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchList({ tab, query, source, page: 1 });
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div className="tabs" role="tablist" aria-label="书库 Tabs">
          <button
            role="tab"
            aria-selected={tab === 'in-stock'}
            className={"tab-button " + (tab === 'in-stock' ? 'active' : '')}
            onClick={() => onSwitch('in-stock')}
          >
            在库书籍
          </button>
          <button
            role="tab"
            aria-selected={tab === 'pending'}
            className={"tab-button " + (tab === 'pending' ? 'active' : '')}
            onClick={() => onSwitch('pending')}
          >
            待获取数据
          </button>
        </div>
        <form onSubmit={onSearch} style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <input
            placeholder="书名 / 作者"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: 'var(--text)' }}
          />
          <input
            placeholder="来源"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: 'var(--text)' }}
          />
          <button className="action-button" type="submit">搜索</button>
        </form>
      </div>

      <div style={{ minHeight: 40 }}>
        {loading ? <p className="muted">加载中…</p> : null}
        {!loading && items.length === 0 ? <p className="muted">没有符合条件的书籍。</p> : null}

        {!loading && items.length > 0 ? (
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
              {items.map((book) => (
                <tr key={book.id}>
                  <td><span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>#{book.id}</span></td>
                  <td><Link className="table-row-link" href={`/books/${book.id}`}>{book.name}</Link></td>
                  <td>{book.author ?? '未知'}</td>
                  <td>{book.source ?? '—'}</td>
                  <td>{book.latestChapter ?? '—'}</td>
                  <td>{formatNumber(book.chapterCount)}</td>
                  <td><StatusPill status={book.status} /></td>
                  <td>{book.status === 0 ? <TriggerButton bookId={book.id} /> : null}</td>
                  <td>{formatDate(new Date(book.createdAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {/* pagination simple controls */}
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="muted">共 {total} 条</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="action-button" disabled={page <= 1} onClick={() => fetchList({ tab, query, source, page: Math.max(1, page - 1) })}>上一页</button>
            <button className="action-button" disabled={items.length < pageSize} onClick={() => fetchList({ tab, query, source, page: page + 1 })}>下一页</button>
          </div>
        </div>
      </div>
    </div>
  );
}
