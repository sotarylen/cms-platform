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
  const resolvedParams = await params;
  const bookId = Number(resolvedParams.id);
  const chapterId = Number(resolvedParams.chapterId);

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

  return (
    <>
      <header className="app-header app-header--compact app-header--reading">
        <div>
          <h1>{book.name}</h1>
          <p className="app-subtitle">正在阅读：{chapter.title}</p>
        </div>
      </header>
      {/* <section className="panel"> */}
        <ChapterContentViewer 
          content={chapter.content}
          prevChapterHref={navigation.prev ? `/books/${book.id}/chapters/${navigation.prev.id}` : undefined}
          nextChapterHref={navigation.next ? `/books/${book.id}/chapters/${navigation.next.id}` : undefined}
          bookHref={`/books/${book.id}`}
          prevChapterTitle={navigation.prev?.title}
          nextChapterTitle={navigation.next?.title}
        />
      {/* </section> */}
    </>
  );
}