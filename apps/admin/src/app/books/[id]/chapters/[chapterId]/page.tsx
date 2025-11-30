import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getBookById } from '@/lib/data/books';
import { getChapterContent, getChapterNavigation } from '@/lib/data/chapters';
import { ChapterContentViewer } from '@/components/chapter-content-viewer';
import { ChapterEditButton } from '@/components/chapter-edit-button';
import { Home, BookOpen } from 'lucide-react';

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
      <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold mb-1">{chapter.title}</h1>
            <p className="text-sm text-muted-foreground">《{book.name}》</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" passHref>
              <Button variant="ghost" size="sm" title="返回首页">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/books/${bookId}` as any} passHref>
              <Button variant="ghost" size="sm" title="返回目录">
                <BookOpen className="h-4 w-4" />
              </Button>
            </Link>
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