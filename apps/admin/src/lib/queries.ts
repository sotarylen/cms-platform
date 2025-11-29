import { query } from '@/lib/db';
import type {
  BookListItem,
  BookSummary,
  RecentChapter,
  ChapterContent,
  ChapterListItem,
  DashboardStats,
  PhasedSummary,
  PlotStage,
  ScriptEpisode,
  ChapterNavigation,
  Album,
  AlbumStudio,
  AlbumStats,
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

  // Note: we intentionally do not exclude books with zero chapters here.
  // Previously an `excludeZeroChapters` flag allowed filtering them out,
  // but we now show all books and let the UI decide which ones to act on.

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

export const getAlbumStats = async (): Promise<AlbumStats> => {
  const [row] = await query<
    Array<{
      albumCount: number;
      modelCount: number;
      studioCount: number;
    }>
  >(
    `
    SELECT
      (SELECT COUNT(*) FROM n8n_albums) AS albumCount,
      (SELECT COUNT(*) FROM n8n_album_models) AS modelCount,
      (SELECT COUNT(*) FROM n8n_album_studios) AS studioCount
    `,
  );

  return { albums: Number(row?.albumCount ?? 0), models: Number(row?.modelCount ?? 0), studios: Number(row?.studioCount ?? 0) };
};

export const getAlbumById = async (albumId: number): Promise<Album | null> => {
  const rows = await query<any[]>(
    `
    SELECT
      a.*,
      s.studio_name,
      m.model_name
    FROM n8n_albums a
    LEFT JOIN n8n_album_studios s ON a.studio_id = s.studio_id
    LEFT JOIN n8n_album_models m ON a.model = m.model_id
    WHERE a.album_id = ?
    LIMIT 1
    `,
    [albumId]
  );

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.album_id,
    resource_url: row.resource_url,
    album_number: row.album_number,
    resource_title_raw: row.resource_title_raw,
    title: row.resource_title_cleaned,
    model: row.model,
    studio_id: row.studio_id,
    source_page_url: row.source_page_url,
    page_number: row.page_number,
    item_order: row.item_order,
    status: row.status,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    studio_name: row.studio_name,
    model_name: row.model_name,
  };
};

export const getAlbums = async ({
  page = 1,
  pageSize = 30,
}: {
  page?: number;
  pageSize?: number;
}): Promise<{
  items: Album[];
  total: number;
  page: number;
  pageSize: number;
}> => {
  const [countRow] = await query<Array<{ total: number }>>(
    'SELECT COUNT(*) AS total FROM n8n_albums'
  );
  const total = Number(countRow?.total ?? 0);
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * pageSize;

  const rows = await query<any[]>(
    `
    SELECT
      a.*,
      s.studio_name,
      m.model_name
    FROM n8n_albums a
    LEFT JOIN n8n_album_studios s ON a.studio_id = s.studio_id
    LEFT JOIN n8n_album_models m ON a.model = m.model_id
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [pageSize, offset]
  );

  const items: Album[] = rows.map((row) => ({
    id: row.album_id,
    resource_url: row.resource_url,
    album_number: row.album_number,
    resource_title_raw: row.resource_title_raw,
    title: row.resource_title_cleaned,
    model: row.model,
    studio_id: row.studio_id,
    source_page_url: row.source_page_url,
    page_number: row.page_number,
    item_order: row.item_order,
    status: row.status,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    studio_name: row.studio_name,
    model_name: row.model_name,
  }));

  return { items, total, page: safePage, pageSize };
};

export const updateAlbumCover = async (albumId: number, coverUrl: string) => {
  await query('UPDATE n8n_albums SET source_page_url = ? WHERE album_id = ?', [
    coverUrl,
    albumId,
  ]);
};

export const getLatestAlbums = async (limit: number = 12): Promise<Album[]> => {
  const rows = await query<any[]>(
    `
    SELECT
      a.*,
      s.studio_name,
      m.model_name
    FROM n8n_albums a
    LEFT JOIN n8n_album_studios s ON a.studio_id = s.studio_id
    LEFT JOIN n8n_album_models m ON a.model = m.model_id
    ORDER BY a.updated_at DESC
    LIMIT ?
    `,
    [limit]
  );

  return rows.map((row) => ({
    id: row.album_id,
    resource_url: row.resource_url,
    album_number: row.album_number,
    resource_title_raw: row.resource_title_raw,
    title: row.resource_title_cleaned,
    model: row.model,
    studio_id: row.studio_id,
    source_page_url: row.source_page_url,
    page_number: row.page_number,
    item_order: row.item_order,
    status: row.status,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    studio_name: row.studio_name,
    model_name: row.model_name,
  }));
};

export const getStudioById = async (studioId: number): Promise<AlbumStudio | null> => {
  const rows = await query<any[]>(
    'SELECT * FROM n8n_album_studios WHERE studio_id = ? LIMIT 1',
    [studioId]
  );

  const row = rows[0];
  if (!row) return null;

  return {
    studio_id: row.studio_id,
    studio_name: row.studio_name,
    studio_url: row.studio_url,
    studio_intro: row.studio_intro,
    studio_cover_url: row.studio_cover_url,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
};

export const getAlbumsByStudio = async (studioId: number): Promise<Album[]> => {
  const rows = await query<any[]>(
    `
    SELECT
      a.*,
      s.studio_name,
      m.model_name
    FROM n8n_albums a
    LEFT JOIN n8n_album_studios s ON a.studio_id = s.studio_id
    LEFT JOIN n8n_album_models m ON a.model = m.model_id
    WHERE a.studio_id = ?
    ORDER BY a.updated_at DESC
    `,
    [studioId]
  );

  return rows.map((row) => ({
    id: row.album_id,
    resource_url: row.resource_url,
    album_number: row.album_number,
    resource_title_raw: row.resource_title_raw,
    title: row.resource_title_cleaned,
    model: row.model,
    studio_id: row.studio_id,
    source_page_url: row.source_page_url,
    page_number: row.page_number,
    item_order: row.item_order,
    status: row.status,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    studio_name: row.studio_name,
    model_name: row.model_name,
  }));
};

export const updateStudio = async (
  studioId: number,
  data: { studio_intro?: string; studio_cover_url?: string }
) => {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.studio_intro !== undefined) {
    updates.push('studio_intro = ?');
    values.push(data.studio_intro);
  }

  if (data.studio_cover_url !== undefined) {
    updates.push('studio_cover_url = ?');
    values.push(data.studio_cover_url);
  }

  if (updates.length === 0) return;

  values.push(studioId);

  await query(
    `UPDATE n8n_album_studios SET ${updates.join(', ')}, updated_at = NOW() WHERE studio_id = ?`,
    values
  );
};
