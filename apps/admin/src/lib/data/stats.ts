import { query } from '@/lib/db';
import type { DashboardStats } from '@/lib/types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const [row] = await query<
        Array<{
            bookCount: number;
            chapterContentCount: number;
            scriptCount: number;
            albumCount: number;
            studioCount: number;
        }>
    >(
        `
    SELECT
      (SELECT COUNT(*) FROM n8n_book_list) AS bookCount,
      (SELECT COUNT(*) FROM n8n_book_chapters_content) AS chapterContentCount,
      (SELECT COUNT(*) FROM n8n_book_tran2script) AS scriptCount,
      (SELECT COUNT(*) FROM n8n_albums) AS albumCount,
      (SELECT COUNT(*) FROM n8n_album_studios) AS studioCount
    `,
    );

    return {
        books: Number(row?.bookCount ?? 0),
        contents: Number(row?.chapterContentCount ?? 0),
        scripts: Number(row?.scriptCount ?? 0),
        albums: Number(row?.albumCount ?? 0),
        studios: Number(row?.studioCount ?? 0),
    };
};
