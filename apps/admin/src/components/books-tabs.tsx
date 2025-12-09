"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import TriggerButton from '@/components/trigger-button';
import { StatusPill } from '@/components/status-pill';
import { formatDate, formatNumber } from '@/lib/utils';
import { Pagination } from '@/components/pagination';
import { ContentCard } from '@/components/data-display/content-card';
import { StandardContainer } from '@/components/standard-container';
import TxtUploadDialog from '@/components/upload/txt-upload-dialog';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

type BookItem = {
  id: number;
  name: string;
  author: string | null;
  source: string | null;
  latestChapter: string | null;
  status: number | null;
  createdAt: string; // ISO
  chapterCount: number;
  cover: string | null;
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
  const [searchValue, setSearchValue] = useState(initialQuery);

  const [loading, setLoading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [items, setItems] = useState<BookItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(30);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const fetchList = async (opts?: { tab?: string; query?: string; source?: string; page?: number; pageSize?: number }) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      p.set('tab', opts?.tab ?? tab);
      if ((opts?.query ?? query) !== '') p.set('query', opts?.query ?? query);
      if ((opts?.source ?? source) !== '') p.set('source', opts?.source ?? source);
      p.set('page', String(opts?.page ?? page));
      p.set('pageSize', String(opts?.pageSize ?? pageSize));

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
    fetchList({ tab, query, source, page, pageSize });
  }, []);

  const onSwitch = (next: string) => {
    if (next === tab) return;
    setTab(next);
    setPage(1);
    fetchList({ tab: next, query, source, page: 1, pageSize });
  };

  const handleSearch = () => {
    setQuery(searchValue);
    setPage(1);
    fetchList({ tab, query: searchValue, source, page: 1, pageSize });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchList({ tab, query, source, page: newPage, pageSize });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    fetchList({ tab, query, source, page: 1, pageSize: newPageSize });
  };

  const handleUploadSuccess = (bookId: number) => {
    // 刷新列表以显示新导入的书籍
    fetchList({ tab, query, source, page, pageSize });
    setUploadDialogOpen(false);
  };

  return (
    <>
      <StandardContainer
        // title="书籍列表"
        actionLeft={
          <div className="flex items-center gap-2">
            <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
              <button
                role="tab"
                aria-selected={tab === 'in-stock'}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${tab === 'in-stock' ? 'bg-background text-foreground shadow-sm' : ''
                  }`}
                onClick={() => onSwitch('in-stock')}
              >
                在库书籍
              </button>
              <button
                role="tab"
                aria-selected={tab === 'pending'}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${tab === 'pending' ? 'bg-background text-foreground shadow-sm' : ''
                  }`}
                onClick={() => onSwitch('pending')}
              >
                待获取数据
              </button>
            </div>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              导入TXT
            </Button>
          </div>
        }
        search={{
          value: searchValue,
          onChange: setSearchValue,
          onSearch: handleSearch,
          placeholder: "书名 / 作者"
        }}
        viewToggle={{
          view: viewMode,
          onViewChange: setViewMode
        }}
      >
      <div className="space-y-4">
        {/* Content */}
        <div className="min-h-[200px]">
          {loading && <p className="text-center text-muted-foreground py-8">加载中…</p>}
          {!loading && items.length === 0 && <p className="text-center text-muted-foreground py-8">没有符合条件的书籍。</p>}

          {!loading && items.length > 0 && (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {items.map((book) => (
                  <ContentCard
                    key={book.id}
                    title={book.name}
                    image={book.cover}
                    href={`/books/${book.id}`}
                    subtitle={
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{book.author || '未知作者'}</span>
                        </div>
                      </div>
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">书名</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">作者</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">来源</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">章节数</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">状态</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">操作</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">入库时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((book) => (
                      <tr key={book.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <span className="text-sm font-semibold text-muted-foreground">#{book.id}</span>
                        </td>
                        <td className="p-4 align-middle">
                          <Link href={`/books/${book.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                            {book.name}
                          </Link>
                        </td>
                        <td className="p-4 align-middle text-sm">{book.author ?? '未知'}</td>
                        <td className="p-4 align-middle text-sm">{book.source ?? '—'}</td>
                        <td className="p-4 align-middle text-sm">{formatNumber(book.chapterCount)}</td>
                        <td className="p-4 align-middle">
                          <StatusPill status={book.status} />
                        </td>
                        <td className="p-4 align-middle">
                          {book.status === 0 ? <TriggerButton bookId={book.id} /> : null}
                        </td>
                        <td className="p-4 align-middle text-sm text-muted-foreground">
                          {formatDate(new Date(book.createdAt))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

        {/* Pagination */}
        <Pagination
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </StandardContainer>

    {/* TXT上传对话框 */}
    <TxtUploadDialog
      open={uploadDialogOpen}
      onOpenChange={setUploadDialogOpen}
      onSuccess={handleUploadSuccess}
    />
    </>
  );
}
