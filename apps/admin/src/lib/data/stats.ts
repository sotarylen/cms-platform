import { query } from '@/lib/db';
import type { DashboardStats } from '@/lib/types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const [row] = await query<
        Array<{
            bookCount: number;
            chapterListCount: number;
            chapterContentCount: number;
            scriptCount: number;
            summaryCount: number;
        }>
    >(
        `
    SELECT
      (SELECT COUNT(*) FROM n8n_book_list) AS bookCount,
      (SELECT COUNT(*) FROM n8n_book_chapters_list) AS chapterListCount,
      (SELECT COUNT(*) FROM n8n_book_chapters_content) AS chapterContentCount,
      (SELECT COUNT(*) FROM n8n_book_tran2script) AS scriptCount,
      (SELECT COUNT(*) FROM n8n_book_summary) AS summaryCount
    `,
    );

    return {
        books: Number(row?.bookCount ?? 0),
        chapters: Number(row?.chapterListCount ?? 0),
        contents: Number(row?.chapterContentCount ?? 0),
        scripts: Number(row?.scriptCount ?? 0),
        summaries: Number(row?.summaryCount ?? 0),
    };
};
