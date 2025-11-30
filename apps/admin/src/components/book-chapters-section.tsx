'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  const chapterTotalPages = Math.max(1, Math.ceil(chapters.total / chapters.pageSize));

  // 生成分页项
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
      const page = chapters.page + offset;
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
    <Card>
      <CardHeader>
        <CardTitle>章节目录</CardTitle>
        <p className="text-sm text-muted-foreground">共 {formatNumber(chapters.total)} 章，点击章节进入正文</p>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-md">
            错误: {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground py-8">加载中…</p>
        ) : chapters.items.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
              {chapters.items.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/books/${bookId}/chapters/${chapter.id}` as any}
                  className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    第 {chapter.sortOrder ?? '—'} 章
                  </div>
                  <div className="text-sm font-medium line-clamp-2">
                    {chapter.title}
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchChapters(Math.max(1, chapters.page - 1))}
                disabled={chapters.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {chapterPageItems.map((item, index) =>
                item.type === 'ellipsis' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                    …
                  </span>
                ) : (
                  <Button
                    key={item.value}
                    variant={item.value === chapters.page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => fetchChapters(item.value)}
                  >
                    {item.value}
                  </Button>
                ),
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchChapters(Math.min(chapterTotalPages, chapters.page + 1))}
                disabled={chapters.page >= chapterTotalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-8">暂无章节列表。</p>
        )}
      </CardContent>
    </Card>
  );
}

export default BookChaptersSection;