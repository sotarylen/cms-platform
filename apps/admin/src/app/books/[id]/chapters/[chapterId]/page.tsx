import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getBookById } from '@/lib/data/books';
import { getChapterContent, getChapterNavigation } from '@/lib/data/chapters';
import { ChapterContentViewer } from '@/components/chapter-content-viewer';
import { ChapterEditButton } from '@/components/chapter-edit-button';
import { Home, BookOpen, ArrowLeft } from 'lucide-react';
import { DetailNavBar } from '@/components/navigation/detail-nav-bar';

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

  if (!book || !chapter || chapter.bookId !== book.id) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      {/* Navigation & Header */}
      <div className="space-y-4 mb-6">
        <div className="px-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">{chapter.title}</h1>
            <p className="text-sm text-muted-foreground">《{book.name}》</p>
          </div>
          <ChapterEditButton
            chapter={{
              id: chapter.id,
              title: chapter.title,
              sortOrder: chapter.sortOrder,
            }}
            bookId={bookId}
          />
        </div>
      </div>

      {/* Reader Content */}
      <ChapterContentViewer
        content={chapter.content}
        prevChapterHref={navigation.prev ? `/books/${book.id}/chapters/${navigation.prev.id}` : undefined}
        nextChapterHref={navigation.next ? `/books/${book.id}/chapters/${navigation.next.id}` : undefined}
        bookHref={`/books/${book.id}`}
        prevChapterTitle={navigation.prev?.title}
        nextChapterTitle={navigation.next?.title}
      />
    </div>
  );
}