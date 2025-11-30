import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/status-pill';
import {
  getBookById,
  getBookSummary,
  getPlotStages,
  getPhasedSummaries,
  getScriptEpisodes,
  getPreviousBook,
  getNextBook
} from '@/lib/data/books';
import { getChapters } from '@/lib/data/chapters';
import { formatDate, formatNumber } from '@/lib/utils';
import { CollapsibleSection } from '@/components/collapsible-section';
import { BookEditButton } from '@/components/book-edit-button';
import { Home, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import dynamic from 'next/dynamic';

const BookFetchButton = dynamic(() => import('@/components/book-fetch-button'));
const BookChaptersSection = dynamic(() => import('@/components/book-chapters-section'));

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) || {};
  const bookId = Number(resolvedParams.id);
  const pageParam = Array.isArray(resolvedSearchParams.chapterPage) ? resolvedSearchParams.chapterPage[0] : resolvedSearchParams.chapterPage;
  const chapterPage = pageParam ? Number(pageParam) : 1;

  const [book, summary, chapters, stages, phases, scripts, prevBook, nextBook] = await Promise.all([
    getBookById(bookId),
    getBookSummary(bookId),
    getChapters({ bookId, page: chapterPage }),
    getPlotStages(bookId),
    getPhasedSummaries(bookId),
    getScriptEpisodes(bookId),
    getPreviousBook(bookId),
    getNextBook(bookId)
  ]);

  if (!book) {
    notFound();
  }

  const coverSrc = book.cover ?? '/default-cover.svg';

  const hasSummaryContent = !!summary?.summary?.trim();
  const hasPhasesContent = phases && phases.some(p => p.summary?.trim());
  const hasStagesContent = stages && stages.some(s => s.summary?.trim());
  const hasScriptsContent = scripts && scripts.some(sc => sc.title?.trim() || sc.keyPlot?.trim() || sc.range?.trim());

  return (
    <div className="space-y-6">
      {/* Navigation Bar */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <Link href="/" passHref>
            <Button variant="outline" size="sm">
              <Home className="mr-2 h-4 w-4" />
              返回首页
            </Button>
          </Link>
          <div className="flex gap-2">
            {prevBook ? (
              <Link href={`/books/${prevBook.id}` as any} passHref>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  上一本
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="mr-2 h-4 w-4" />
                上一本
              </Button>
            )}
            <Link href="/?status=all" passHref>
              <Button variant="outline" size="sm">
                <BookOpen className="mr-2 h-4 w-4" />
                所有书籍
              </Button>
            </Link>
            {nextBook ? (
              <Link href={`/books/${nextBook.id}` as any} passHref>
                <Button variant="outline" size="sm">
                  下一本
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled>
                下一本
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Book Hero Section */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-[1fr_200px]">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">{book.name}</h1>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">作者：{book.author ?? '未知'}</Badge>
                <Badge variant="secondary">来源：{book.source ?? '—'}</Badge>
                <Badge variant="secondary">分类：{book.category ?? '未分类'}</Badge>
                <Badge variant="secondary">章节：{formatNumber(book.chapterCount)}</Badge>
                <Badge variant="secondary">最新章节：{book.latestChapter ?? '未记录'}</Badge>
                <Badge variant="secondary">入库：{formatDate(book.createdAt)}</Badge>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {book.introduce ?? '暂无简介'}
              </p>

              <div className="flex flex-wrap gap-2">
                <StatusPill status={book.status} />
                <BookEditButton book={book} />
                <BookFetchButton
                  bookId={book.id}
                  status={book.status}
                />
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative w-[200px] h-[300px] rounded-lg overflow-hidden border shadow-lg">
                <Image
                  src={coverSrc}
                  alt={`${book.name} 封面`}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapters Section */}
      <BookChaptersSection bookId={bookId} initialChapters={chapters} />

      {/* Summary Section */}
      {hasSummaryContent && (
        <CollapsibleSection
          title="整书摘要"
          subtitle={summary?.totalChapters ? `覆盖 ${summary.totalChapters} 章` : ''}
          defaultOpen={false}
          actions={
            <Link href={`/books/${book.id}/export/summary` as any} passHref>
              <Button variant="outline" size="sm">
                导出文本
              </Button>
            </Link>
          }
        >
          <p className="whitespace-pre-line text-sm leading-relaxed">{summary?.summary}</p>
        </CollapsibleSection>
      )}

      {/* Phased Summaries */}
      {hasPhasesContent && (
        <CollapsibleSection
          title="阶段性摘要"
          subtitle="快速了解主线推进"
          defaultOpen={false}
          actions={
            <Link href={`/books/${book.id}/export/phases` as any} passHref>
              <Button variant="outline" size="sm">
                导出文本
              </Button>
            </Link>
          }
        >
          <div className="space-y-4">
            {phases
              .filter((phase) => phase.summary && phase.summary.trim() !== '')
              .map((phase) => (
                <Card key={phase.id}>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      第 {phase.startSort} - {phase.endSort} 章
                    </p>
                    <p className="whitespace-pre-line text-sm leading-relaxed">{phase.summary}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Plot Stages */}
      {hasStagesContent && (
        <CollapsibleSection
          title="剧情阶段 / 战斗节奏"
          subtitle="对外宣推或制作改编时的核心素材"
          defaultOpen={false}
          actions={
            <Link href={`/books/${book.id}/export/stages` as any} passHref>
              <Button variant="outline" size="sm">
                导出文本
              </Button>
            </Link>
          }
        >
          <div className="space-y-4">
            {stages
              .filter((stage) => stage.summary && stage.summary.trim() !== '')
              .map((stage) => (
                <Card key={stage.id}>
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      阶段 {stage.stageNumber} · 第 {stage.startEpisode}-{stage.endEpisode} 集
                    </p>
                    <h4 className="font-semibold">{stage.stageName}</h4>
                    <p className="whitespace-pre-line text-sm leading-relaxed">{stage.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {stage.stageGoal && <Badge variant="outline">目标：{stage.stageGoal}</Badge>}
                      {stage.conflict && <Badge variant="outline">冲突：{stage.conflict}</Badge>}
                      {stage.protagonistUpgrade && (
                        <Badge variant="outline">主角成长：{stage.protagonistUpgrade}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Scripts */}
      {hasScriptsContent && (
        <CollapsibleSection
          title="改编剧本"
          subtitle={`共 ${formatNumber(scripts.length)} 集，按剧集顺序展示`}
          defaultOpen={false}
        >
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">集数</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">标题</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">时长</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">章节范围</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">关键剧情</th>
                </tr>
              </thead>
              <tbody>
                {scripts
                  .filter((sc) => (sc.title && sc.title.trim() !== '') || (sc.keyPlot && sc.keyPlot.trim() !== '') || (sc.range && sc.range.trim() !== ''))
                  .map((script) => (
                    <tr key={script.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">第 {script.episode} 集</td>
                      <td className="p-4 align-middle">{script.title ?? '未命名'}</td>
                      <td className="p-4 align-middle">{script.duration} min</td>
                      <td className="p-4 align-middle">{script.range ?? '—'}</td>
                      <td className="p-4 align-middle whitespace-pre-line text-sm">{script.keyPlot ?? '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
