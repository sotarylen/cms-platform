import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TriggerButton from '@/components/trigger-button';
import AnimatedNumber from '@/components/animated-number';
import { getDashboardStats } from '@/lib/data/stats';
import { getLatestChapters } from '@/lib/data/chapters';
import { getBooks, type BookListResponse } from '@/lib/data/books';
import { formatDate, formatNumber } from '@/lib/utils';
import BooksTabsWrapper from '@/components/books-tabs-wrapper';
import { BookOpen, FileText, ScrollText, Film, FileCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/stat-card';

type SearchParams = Record<string, string | string[] | undefined>;

export const dynamic = 'force-dynamic';

const normalizeParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const getStatusBadge = (status: number | null) => {
  if (status === null) return <Badge variant="secondary">未知</Badge>;
  if (status === 0) return <Badge variant="outline">待入库</Badge>;
  if (status === 1) return <Badge variant="default">连载中</Badge>;
  if (status === 2) return <Badge variant="secondary">已完结</Badge>;
  return <Badge variant="secondary">其他</Badge>;
};

const renderBooksTable = (data: BookListResponse) => {
  if (!data.items.length) {
    return <p className="text-muted-foreground text-center py-8">没有符合条件的书籍。</p>;
  }

  return (
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
          {data.items.map((book) => (
            <tr key={book.id} className="border-b transition-colors hover:bg-muted/50">
              <td className="p-4 align-middle">
                <span className="text-sm font-semibold text-muted-foreground">#{book.id}</span>
              </td>
              <td className="p-4 align-middle">
                <Link
                  href={`/books/${book.id}` as any}
                  className="font-medium hover:underline"
                >
                  {book.name}
                </Link>
              </td>
              <td className="p-4 align-middle text-sm">{book.author ?? '未知'}</td>
              <td className="p-4 align-middle text-sm">{book.source ?? '—'}</td>
              <td className="p-4 align-middle text-sm">{formatNumber(book.chapterCount)}</td>
              <td className="p-4 align-middle">
                {getStatusBadge(book.status)}
              </td>
              <td className="p-4 align-middle">
                {book.status === 0 ? <TriggerButton bookId={book.id} /> : null}
              </td>
              <td className="p-4 align-middle text-sm text-muted-foreground">
                {formatDate(book.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

  const [books, latestChapters] = await Promise.all([
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

  // Fetch stats
  const stats = await getDashboardStats();



  return (
    <div className="space-y-6">
      <PageHeader
        title="书籍管理"
        subtitle="管理和查看所有书籍、章节和相关内容。"
      />
      {/* Statistics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="书籍数量"
          value={stats.books}
          icon={BookOpen}
          gradient="from-blue-500/10 to-blue-500/5"
        />
        <StatCard
          title="章节目录"
          value={stats.chapters}
          icon={FileText}
          gradient="from-green-500/10 to-green-500/5"
        />
        <StatCard
          title="章节正文"
          value={stats.contents}
          icon={ScrollText}
          gradient="from-purple-500/10 to-purple-500/5"
        />
        <StatCard
          title="剧集脚本"
          value={stats.scripts}
          icon={Film}
          gradient="from-orange-500/10 to-orange-500/5"
        />
        <StatCard
          title="整书摘要"
          value={stats.summaries}
          icon={FileCheck}
          gradient="from-pink-500/10 to-pink-500/5"
        />
      </div>

      {/* Books List Section */}
      <Card>
        <BooksTabsWrapper
          initialTab={tabParam}
          initialQuery={query}
          initialSource={source}
          initialPage={page}
        />
      </Card>
    </div>
  );
}
