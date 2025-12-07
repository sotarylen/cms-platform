'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import { Pagination } from '@/components/pagination';
import { StandardContainer } from '@/components/standard-container';
import type { ChapterListItem } from '@/lib/types';

type ChaptersSectionProps = {
  bookId: number;
  initialChapters: {
    items: ChapterListItem[];
    total: number;
    page: number;
    pageSize: number;
  };
};

export function BookChaptersSection({ bookId, initialChapters }: ChaptersSectionProps) {
  const [chapters, setChapters] = useState(initialChapters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取章节数据
  const fetchChapters = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/books/${bookId}/chapters?page=${page}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch chapters');
      }

      setChapters(data);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('chapterPage', page.toString());
        window.history.replaceState({}, '', url);
      }
    } catch (err) {
      console.error('Failed to fetch chapters:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chapters');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StandardContainer
      title={
        <div>
          <h3 className="text-lg font-semibold tracking-tight">章节目录</h3>
          <p className="text-sm text-muted-foreground mt-1">共 {formatNumber(chapters.total)} 章，点击章节进入正文</p>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            错误: {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground py-8">加载中…</p>
        ) : chapters.items.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {chapters.items.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/books/${bookId}/chapters/${chapter.id}`}
                  className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    第 {chapter.sortOrder ?? '—'} 章
                  </div>
                  <div className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {chapter.title}
                  </div>
                </Link>
              ))}
            </div>

            <Pagination
              total={chapters.total}
              page={chapters.page}
              pageSize={chapters.pageSize}
              onPageChange={fetchChapters}
            />
          </>
        ) : (
          <p className="text-center text-muted-foreground py-8">暂无章节列表。</p>
        )}
      </div>
    </StandardContainer>
  );
}

export default BookChaptersSection;