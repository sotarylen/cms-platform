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

  const statCards = [
    { label: '书籍数量', value: stats.books, icon: BookOpen, color: 'text-blue-600' },
    { label: '章节目录', value: stats.chapters, icon: FileText, color: 'text-green-600' },
    { label: '章节正文', value: stats.contents, icon: ScrollText, color: 'text-purple-600' },
    { label: '剧集脚本', value: stats.scripts, icon: Film, color: 'text-orange-600' },
    { label: '整书摘要', value: stats.summaries, icon: FileCheck, color: 'text-pink-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Section */}
      <Card>
        <CardHeader>
          <CardTitle>数据一览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">
                        <AnimatedNumber value={stat.value} duration={1000} />
                      </p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Books List Section */}
      <Card>
        <CardContent className="pt-6">
          <BooksTabsWrapper
            initialTab={tabParam}
            initialQuery={query}
            initialSource={source}
            initialPage={page}
          />
        </CardContent>
      </Card>
    </div>
  );
}
