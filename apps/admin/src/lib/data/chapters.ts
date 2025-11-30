import { query } from '@/lib/db';
import type {
    ChapterListItem,
    RecentChapter,
    ChapterContent,
    ChapterNavigation,
} from '@/lib/types';

const PAGE_SIZE = 30;

export const getChapters = async ({
    bookId,
    page = 1,
    pageSize = PAGE_SIZE,
}: {
    bookId: number;
    page?: number;
    pageSize?: number;
}): Promise<{
    items: ChapterListItem[];
    total: number;
    page: number;
    pageSize: number;
}> => {
    const [countRow] = await query<Array<{ total: number }>>(
        'SELECT COUNT(*) AS total FROM n8n_book_chapters_content WHERE book_id = ?',
        [bookId],
    );
    const total = Number(countRow?.total ?? 0);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * pageSize;

    const rows = await query<any[]>(
        `
    SELECT id, chapter_title, chapter_sort, chapter_file_size, chapter_file_type, created_at
    FROM n8n_book_chapters_content
    WHERE book_id = ?
    ORDER BY chapter_sort IS NULL, chapter_sort ASC, id ASC
    LIMIT ? OFFSET ?
    `,
        [bookId, pageSize, offset],
    );

    const items: ChapterListItem[] = rows.map((row) => ({
        id: row.id,
        title: row.chapter_title,
        sortOrder: row.chapter_sort,
        fileSize: row.chapter_file_size,
        fileType: row.chapter_file_type,
        createdAt: new Date(row.created_at),
    }));

    return { items, total, page: safePage, pageSize };
};

export const getLatestChapters = async (limit = 10): Promise<RecentChapter[]> => {
    const rows = await query<any[]>(
        `
    SELECT c.id, c.book_id, b.book_name, c.chapter_title, c.created_at
    FROM n8n_book_chapters_content c
    LEFT JOIN n8n_book_list b ON b.id = c.book_id
    ORDER BY c.id DESC
    LIMIT ?
    `,
        [limit],
    );

    return rows.map((row) => ({
        id: row.id,
        bookId: row.book_id,
        bookName: row.book_name,
        chapterTitle: row.chapter_title,
        createdAt: new Date(row.created_at),
    }));
};

export const getChapterContent = async (
    chapterId: number,
): Promise<ChapterContent | null> => {
    const rows = await query<any[]>(
        `
    SELECT *
    FROM n8n_book_chapters_content
    WHERE id = ?
    LIMIT 1
    `,
        [chapterId],
    );
    const row = rows[0];
    if (!row) return null;
    return {
        id: row.id,
        bookId: row.book_id,
        title: row.chapter_title,
        sortOrder: row.chapter_sort,
        content: row.chapter_content,
        summary: row.chapter_summary,
        fileSize: row.chapter_file_size,
        fileType: row.chapter_file_type,
        createdAt: new Date(row.created_at),
    };
};

export const getChapterNavigation = async (
    bookId: number,
    chapterId: number,
): Promise<ChapterNavigation> => {
    const rows = await query<any[]>(
        `
    SELECT *
    FROM (
      SELECT
        id,
        chapter_title,
        LAG(id) OVER w AS prev_id,
        LAG(chapter_title) OVER w AS prev_title,
        LEAD(id) OVER w AS next_id,
        LEAD(chapter_title) OVER w AS next_title
      FROM n8n_book_chapters_content
      WHERE book_id = ?
      WINDOW w AS (
        PARTITION BY book_id
        ORDER BY chapter_sort IS NULL, chapter_sort, id
      )
    ) ranked
    WHERE id = ?
    LIMIT 1
    `,
        [bookId, chapterId],
    );

    const row = rows[0];
    const toNeighbor = (
        id?: number | null,
        title?: string | null,
    ): ChapterNavigation['prev'] =>
        id ? { id, title: title ?? '未命名章节' } : null;

    if (!row) {
        return { prev: null, next: null };
    }

    return {
        prev: toNeighbor(row.prev_id, row.prev_title),
        next: toNeighbor(row.next_id, row.next_title),
    };
};
