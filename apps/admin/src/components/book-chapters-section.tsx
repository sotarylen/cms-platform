'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
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
      // 更新URL但不刷新页面
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
  
  // 构建章节分页链接
  const buildChapterPageLink = (targetPage: number) => {
    // 构建相对URL以确保服务端和客户端一致
    const searchParams = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.search : ''
    );
    searchParams.set('chapterPage', targetPage.toString());
    return `?${searchParams.toString()}`;
  };

  return (
    <section className="panel collapsible">
      <div className="collapsible-header">
        <button
          type="button"
          className="collapsible-trigger"
          onClick={() => {
            // 这里可以添加展开/收起逻辑，但为了保持与原功能一致，我们保持始终展开
          }}
          aria-expanded={true}
        >
          <div>
            <h3>章节目录</h3>
            <p className="muted">共 {formatNumber(chapters.total)} 章，点击章节进入正文</p>
          </div>
          <span className="chevron" data-open={true}>
            <i className={`fas fa-chevron-up`}></i>
          </span>
        </button>
      </div>
      
      <div className="collapsible-content">
        {error && (
          <div className="error-message" style={{ padding: '12px', color: 'var(--danger)' }}>
            错误: {error}
          </div>
        )}
        
        {loading ? (
          <p className="muted">加载中…</p>
        ) : chapters.items.length ? (
          <>
            <div className="chapter-grid">
              {chapters.items.map((chapter) => (
                <article key={chapter.id} className="chapter-card">
                  <div className="chapter-card-order">第 {chapter.sortOrder ?? '—'} 章</div>
                  <Link href={`/books/${bookId}/chapters/${chapter.id}`} className="chapter-card-title">
                    {chapter.title}
                  </Link>
                </article>
              ))}
            </div>
            <div className="chapter-pagination">
              <a
                className="page-link"
                href={buildChapterPageLink(Math.max(1, chapters.page - 1))}
                onClick={(e) => {
                  e.preventDefault();
                  fetchChapters(Math.max(1, chapters.page - 1));
                }}
                aria-disabled={chapters.page <= 1 ? 'true' : 'false'}
              >
                <i className="fas fa-chevron-left"></i>
              </a>
              {chapterPageItems.map((item, index) =>
                item.type === 'ellipsis' ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis" aria-disabled="true">
                    …
                  </span>
                ) : (
                  <a
                    key={item.value}
                    className={`page-link${item.value === chapters.page ? ' page-link--current' : ''}`}
                    href={buildChapterPageLink(item.value)}
                    onClick={(e) => {
                      e.preventDefault();
                      fetchChapters(item.value);
                    }}
                  >
                    {item.value}
                  </a>
                ),
              )}
              <a
                className="page-link"
                href={buildChapterPageLink(Math.min(chapterTotalPages, chapters.page + 1))}
                onClick={(e) => {
                  e.preventDefault();
                  fetchChapters(Math.min(chapterTotalPages, chapters.page + 1));
                }}
                aria-disabled={chapters.page >= chapterTotalPages ? 'true' : 'false'}
              >
                <i className="fas fa-chevron-right"></i>
              </a>
            </div>
          </>
        ) : (
          <p className="muted">暂无章节列表。</p>
        )}
      </div>
    </section>
  );
}

export default BookChaptersSection;