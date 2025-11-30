import { query } from '@/lib/db';
import type {
    BookListItem,
    BookSummary,
    PlotStage,
    PhasedSummary,
    ScriptEpisode,
} from '@/lib/types';

const PAGE_SIZE = 30;

export type BookListResponse = {
    items: BookListItem[];
    total: number;
    page: number;
    pageSize: number;
};

const mapBookRows = (rows: any[]): BookListItem[] =>
    rows.map((row) => ({
        id: row.id,
        name: row.book_name,
        author: row.book_author,
        category: row.book_catagory,
        source: row.book_source,
        latestChapter: row.book_latest_chapter,
        status: row.book_process_status,
        createdAt: new Date(row.created_at),
        chapterCount: Number(row.chapter_count ?? 0),
    }));

export const getBooks = async ({
    search,
    status,
    source,
    minChapters,
    maxChapters,
    page = 1,
    pageSize = PAGE_SIZE,
    order,
}: {
    search?: string;
    status?: string;
    source?: string;
    minChapters?: number;
    maxChapters?: number;
    page?: number;
    pageSize?: number;
    order?: 'id_desc' | 'id_asc' | 'created_at_desc';
}): Promise<BookListResponse> => {
    const filters: string[] = [];
    const params: unknown[] = [];

    if (search) {
        filters.push('(b.book_name LIKE ? OR b.book_author LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
    }

    if (status && status !== 'all') {
        filters.push('b.book_process_status = ?');
        params.push(Number(status));
    }

    if (source) {
        filters.push('b.book_source LIKE ?');
        params.push(`%${source}%`);
    }

    if (minChapters != null && !Number.isNaN(minChapters)) {
        filters.push('COALESCE(ch.chapter_count, 0) >= ?');
        params.push(minChapters);
    }

    if (maxChapters != null && !Number.isNaN(maxChapters)) {
        filters.push('COALESCE(ch.chapter_count, 0) <= ?');
        params.push(maxChapters);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const countRows = await query<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total FROM n8n_book_list b
    LEFT JOIN (
      SELECT book_id, COUNT(*) AS chapter_count
      FROM n8n_book_chapters_content
      GROUP BY book_id
    ) ch ON ch.book_id = b.id
    ${whereClause}`,
        params,
    );
    const total = Number(countRows[0]?.total ?? 0);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * pageSize;

    const orderClause =
        order === 'id_desc'
            ? 'ORDER BY b.id DESC'
            : order === 'id_asc'
                ? 'ORDER BY b.id ASC'
                : 'ORDER BY b.created_at DESC';

    const rows = await query<any[]>(
        `
    SELECT
      b.id,
      b.book_name,
      b.book_author,
      b.book_catagory,
      b.book_source,
      b.book_latest_chapter,
      b.book_process_status,
      b.created_at,
      COALESCE(ch.chapter_count, 0) AS chapter_count
    FROM n8n_book_list b
    LEFT JOIN (
      SELECT book_id, COUNT(*) AS chapter_count
      FROM n8n_book_chapters_content
      GROUP BY book_id
    ) ch ON ch.book_id = b.id
    ${whereClause}
    ${orderClause}
    LIMIT ? OFFSET ?
    `,
        [...params, pageSize, offset],
    );

    return {
        items: mapBookRows(rows),
        total,
        page: safePage,
        pageSize,
    };
};

export const getBookById = async (bookId: number) => {
    const rows = await query<any[]>(
        `
    SELECT
      b.*,
      COALESCE(ch.chapter_count, 0) AS chapter_count
    FROM n8n_book_list b
    LEFT JOIN (
      SELECT book_id, COUNT(*) AS chapter_count
      FROM n8n_book_chapters_content
      GROUP BY book_id
    ) ch ON ch.book_id = b.id
    WHERE b.id = ?
    LIMIT 1
    `,
        [bookId],
    );
    const row = rows[0];
    if (!row) {
        return null;
    }
    return {
        id: row.id,
        name: row.book_name,
        author: row.book_author,
        category: row.book_catagory,
        source: row.book_source,
        url: row.book_url,
        latestChapter: row.book_latest_chapter,
        introduce: row.book_introduce,
        cover: row.book_cover_url,
        status: row.book_process_status,
        createdAt: new Date(row.created_at),
        chapterCount: Number(row.chapter_count ?? 0),
    };
};

export const getBookSummary = async (
    bookId: number,
): Promise<BookSummary | null> => {
    const rows = await query<
        Array<{ summary_content: string | null; summary_total_charpters: number }>
    >(
        `
    SELECT summary_content, summary_total_charpters
    FROM n8n_book_summary
    WHERE book_id = ?
    LIMIT 1
    `,
        [bookId],
    );
    const row = rows[0];
    if (!row) return null;
    return {
        summary: row.summary_content,
        totalChapters: row.summary_total_charpters,
    };
};

export const getPlotStages = async (bookId: number): Promise<PlotStage[]> => {
    const rows = await query<any[]>(
        `
    SELECT *
    FROM n8n_book_plot_stages
    WHERE book_id = ?
    ORDER BY stage_number ASC
    `,
        [bookId],
    );
    return rows.map((row) => ({
        id: row.id,
        stageNumber: row.stage_number,
        stageName: row.stage_name,
        startEpisode: row.start_episode,
        endEpisode: row.end_episode,
        summary: row.summary,
        protagonistUpgrade: row.protagonist_upgrade,
        stageGoal: row.stage_goal,
        conflict: row.conflict,
    }));
};

export const getPhasedSummaries = async (
    bookId: number,
): Promise<PhasedSummary[]> => {
    const rows = await query<any[]>(
        `
    SELECT *
    FROM n8n_book_phased_summaries
    WHERE book_id = ?
    ORDER BY start_chapter_sort ASC
    `,
        [bookId],
    );
    return rows.map((row) => ({
        id: row.id,
        startSort: row.start_chapter_sort,
        endSort: row.end_chapter_sort,
        summary: row.phased_summary_content,
    }));
};

export const getScriptEpisodes = async (
    bookId: number,
): Promise<ScriptEpisode[]> => {
    const rows = await query<any[]>(
        `
    SELECT *
    FROM n8n_book_tran2script
    WHERE book_id = ?
    ORDER BY script_episode_num ASC
    `,
        [bookId],
    );
    return rows.map((row) => ({
        id: row.id,
        episode: row.script_episode_num,
        title: row.script_episode_title,
        duration: row.script_episode_duration_min,
        keyPlot: row.script_key_plot,
        range: row.script_cro_chapter_range,
    }));
};

export const updateBookCover = async (bookId: number, coverUrl: string) => {
    await query('UPDATE n8n_book_list SET book_cover_url = ? WHERE id = ?', [
        coverUrl,
        bookId,
    ]);
};

export const getPreviousBook = async (bookId: number) => {
    const rows = await query<any[]>(
        `
    SELECT id, book_name
    FROM n8n_book_list
    WHERE id < ?
    ORDER BY id DESC
    LIMIT 1
    `,
        [bookId],
    );

    const row = rows[0];
    if (!row) return null;

    return {
        id: row.id,
        name: row.book_name,
    };
};

export const getNextBook = async (bookId: number) => {
    const rows = await query<any[]>(
        `
    SELECT id, book_name
    FROM n8n_book_list
    WHERE id > ?
    ORDER BY id ASC
    LIMIT 1
    `,
        [bookId],
    );

    const row = rows[0];
    if (!row) return null;

    return {
        id: row.id,
        name: row.book_name,
    };
};

export const getLatestBooks = async (limit: number = 5): Promise<BookListItem[]> => {
    const rows = await query<any[]>(
        `
    SELECT
      b.id,
      b.book_name,
      b.book_author,
      b.book_catagory,
      b.book_source,
      b.book_latest_chapter,
      b.book_process_status,
      b.created_at,
      COALESCE(ch.chapter_count, 0) AS chapter_count
    FROM n8n_book_list b
    LEFT JOIN (
      SELECT book_id, COUNT(*) AS chapter_count
      FROM n8n_book_chapters_content
      GROUP BY book_id
    ) ch ON ch.book_id = b.id
    ORDER BY b.created_at DESC
    LIMIT ?
    `,
        [limit]
    );

    return mapBookRows(rows);
};
