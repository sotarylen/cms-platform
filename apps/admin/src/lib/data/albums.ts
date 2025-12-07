import { query } from '@/lib/db';
import type {
    Album,
    AlbumStudio,
    AlbumStats,
    AlbumModel,
} from '@/lib/types';
import { getAlbumImageCount, getAlbumVideoCount, getAlbumImages } from '@/lib/album-images';

export const getAlbumStats = async (): Promise<AlbumStats> => {
    const [row] = await query<
        Array<{
            albumCount: number;
            modelCount: number;
            studioCount: number;
            todayNewCount: number;
            recentUpdate: string | null;
        }>
    >(
        `
    SELECT
      (SELECT COUNT(*) FROM n8n_albums) AS albumCount,
      (SELECT COUNT(*) FROM n8n_album_models) AS modelCount,
      (SELECT COUNT(*) FROM n8n_album_studios) AS studioCount,
      (SELECT COUNT(*) FROM n8n_albums WHERE DATE(created_at) = CURDATE()) AS todayNewCount,
      (SELECT MAX(updated_at) FROM n8n_albums) AS recentUpdate
    `,
    );

    // Format recent update time as structured data
    let recentUpdateStr = '-';
    if (row?.recentUpdate) {
        const updateDate = new Date(row.recentUpdate);
        const now = new Date();
        const diffMs = now.getTime() - updateDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) {
            recentUpdateStr = '刚刚';
        } else if (diffMins < 60) {
            recentUpdateStr = `${diffMins}|分钟前`;
        } else if (diffHours < 24) {
            recentUpdateStr = `${diffHours}|小时前`;
        } else if (diffDays < 7) {
            recentUpdateStr = `${diffDays}|天前`;
        } else {
            recentUpdateStr = updateDate.toLocaleDateString('zh-CN');
        }
    }

    return {
        albums: Number(row?.albumCount ?? 0),
        models: Number(row?.modelCount ?? 0),
        studios: Number(row?.studioCount ?? 0),
        todayNew: Number(row?.todayNewCount ?? 0),
        recentUpdate: recentUpdateStr
    };
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

    // Auto-set cover to first image if not set
    let coverUrl = row.source_page_url;
    if (!coverUrl || coverUrl.trim() === '') {
        const images = getAlbumImages(albumId);
        if (images.length > 0) {
            coverUrl = `/api/images/albums/${albumId}/${images[0]}`;
        }
    }

    return {
        id: row.album_id,
        resource_url: row.resource_url,
        album_number: row.album_number,
        resource_title_raw: row.resource_title_raw,
        title: row.resource_title_cleaned,
        model: row.model,
        model_id: row.model, // Add model_id for consistency
        studio_id: row.studio_id,
        source_page_url: coverUrl,
        page_number: row.page_number,
        item_order: row.item_order,
        status: row.status,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        studio_name: row.studio_name,
        model_name: row.model_name,
    };
};

interface GetAlbumsOptions {
    page?: number;
    pageSize?: number;
    query?: string;
    sort?: 'newest' | 'oldest' | 'updated';
}

export async function getAlbums({
    page = 1,
    pageSize = 12,
    query: searchQuery = '',
    sort = 'newest',
}: GetAlbumsOptions): Promise<{
    items: Album[];
    total: number;
    page: number;
    pageSize: number;
}> {
    // Build WHERE clause for search
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    if (searchQuery && searchQuery.trim()) {
        whereConditions.push(`(
            a.resource_title_raw LIKE ? OR 
            a.resource_title_cleaned LIKE ? OR 
            s.studio_name LIKE ? OR 
            m.model_name LIKE ?
        )`);
        const searchPattern = `%${searchQuery.trim()}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total with search filter
    const countSql = `
        SELECT COUNT(*) AS total 
        FROM n8n_albums a
        LEFT JOIN n8n_album_studios s ON a.studio_id = s.studio_id
        LEFT JOIN n8n_album_models m ON a.model = m.model_id
        ${whereClause}
    `;
    const [countRow] = await query<Array<{ total: number }>>(countSql, queryParams);
    const total = Number(countRow?.total ?? 0);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * pageSize;

    let orderBy = 'a.created_at DESC';
    if (sort === 'oldest') {
        orderBy = 'a.created_at ASC';
    } else if (sort === 'updated') {
        orderBy = 'a.updated_at DESC';
    }

    // Select with search filter
    const selectSql = `
        SELECT
          a.*,
          s.studio_name,
          m.model_name
        FROM n8n_albums a
        LEFT JOIN n8n_album_studios s ON a.studio_id = s.studio_id
        LEFT JOIN n8n_album_models m ON a.model = m.model_id
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
    `;
    const rows = await query<any[]>(selectSql, [...queryParams, pageSize, offset]);

    const items: Album[] = await Promise.all(rows.map(async (row) => {
        // Auto-set cover to first image if not set
        let coverUrl = row.source_page_url;
        if (!coverUrl || coverUrl.trim() === '') {
            const images = getAlbumImages(row.album_id);
            if (images.length > 0) {
                coverUrl = `/api/images/albums/${row.album_id}/${images[0]}`;
            }
        }

        return {
            id: row.album_id,
            resource_url: row.resource_url,
            album_number: row.album_number,
            resource_title_raw: row.resource_title_raw,
            title: row.resource_title_cleaned,
            model: row.model,
            model_id: row.model, // Add model_id for consistency
            studio_id: row.studio_id,
            source_page_url: coverUrl,
            page_number: row.page_number,
            item_order: row.item_order,
            status: row.status,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
            studio_name: row.studio_name,
            model_name: row.model_name,
            image_count: await getAlbumImageCount(row.album_id),
            video_count: await getAlbumVideoCount(row.album_id),
        };
    }));

    return { items, total, page: safePage, pageSize };
}

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

    return rows.map((row) => {
        // Auto-set cover to first image if not set
        let coverUrl = row.source_page_url;
        if (!coverUrl || coverUrl.trim() === '') {
            const images = getAlbumImages(row.album_id);
            if (images.length > 0) {
                coverUrl = `/api/images/albums/${row.album_id}/${images[0]}`;
            }
        }

        return {
            id: row.album_id,
            resource_url: row.resource_url,
            album_number: row.album_number,
            resource_title_raw: row.resource_title_raw,
            title: row.resource_title_cleaned,
            model: row.model,
            studio_id: row.studio_id,
            source_page_url: coverUrl,
            page_number: row.page_number,
            item_order: row.item_order,
            status: row.status,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
            studio_name: row.studio_name,
            model_name: row.model_name,
        };
    });
};

export const getStudios = async (): Promise<AlbumStudio[]> => {
    const rows = await query<any[]>(
        `SELECT 
            s.*,
            COUNT(a.album_id) as album_count
        FROM n8n_album_studios s
        LEFT JOIN n8n_albums a ON s.studio_id = a.studio_id
        GROUP BY s.studio_id
        ORDER BY s.studio_name ASC`
    );

    return rows.map((row) => {
        // Filter out placeholder image to avoid 404 errors
        let coverUrl = row.studio_cover_url;
        if (coverUrl === '/placeholder-studio.jpg' || coverUrl === 'placeholder-studio.jpg') {
            coverUrl = null;
        }

        return {
            studio_id: row.studio_id,
            studio_name: row.studio_name,
            studio_url: row.studio_url,
            studio_intro: row.studio_intro,
            studio_cover_url: coverUrl,
            album_count: Number(row.album_count) || 0,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
        };
    });
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

export const getAlbumsByStudio = async (
    studioId: number,
    options: { page?: number; pageSize?: number } = {}
): Promise<{ items: Album[]; total: number }> => {
    const { page = 1, pageSize = 30 } = options;
    const offset = (page - 1) * pageSize;

    // Get total count
    const countRows = await query<any[]>(
        'SELECT COUNT(*) as total FROM n8n_albums WHERE studio_id = ?',
        [studioId]
    );
    const total = countRows[0]?.total || 0;

    // Get paginated items
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
    LIMIT ? OFFSET ?
    `,
        [studioId, pageSize, offset]
    );

    const items = rows.map((row) => {
        // Auto-set cover to first image if not set
        let coverUrl = row.source_page_url;

        if (!coverUrl || coverUrl.trim() === '') {
            const images = getAlbumImages(row.album_id);
            if (images.length > 0) {
                coverUrl = `/api/images/albums/${row.album_id}/${images[0]}`;
            }
        }

        return {
            id: row.album_id,
            resource_url: row.resource_url,
            album_number: row.album_number,
            resource_title_raw: row.resource_title_raw,
            title: row.resource_title_cleaned,
            model: row.model,
            model_id: row.model, // Add model_id for consistency
            studio_id: row.studio_id,
            source_page_url: coverUrl,
            page_number: row.page_number,
            item_order: row.item_order,
            status: row.status,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
            studio_name: row.studio_name,
            model_name: row.model_name,
            image_count: row.image_count || 0,
            video_count: row.video_count || 0,
        };
    });

    return { items, total };
};

export const updateStudio = async (
    studioId: number,
    data: { studio_name?: string; studio_intro?: string; studio_cover_url?: string }
) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.studio_name !== undefined) {
        updates.push('studio_name = ?');
        values.push(data.studio_name);
    }

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

export const createStudio = async (data: {
    studio_name: string;
    studio_intro?: string;
    studio_cover_url?: string;
}): Promise<number> => {
    const result = await query<any>(
        `INSERT INTO n8n_album_studios (
            studio_name, 
            studio_intro,
            studio_cover_url, 
            created_at, 
            updated_at
        ) VALUES (?, ?, ?, NOW(), NOW())`,
        [
            data.studio_name,
            data.studio_intro || null,
            data.studio_cover_url || null
        ]
    );
    return result.insertId;
};

export const getAdjacentAlbums = async (currentId: number): Promise<{ prevId: number | null; nextId: number | null }> => {
    const [prevRow] = await query<Array<{ album_id: number }>>(
        'SELECT album_id FROM n8n_albums WHERE album_id < ? ORDER BY album_id DESC LIMIT 1',
        [currentId]
    );

    const [nextRow] = await query<Array<{ album_id: number }>>(
        'SELECT album_id FROM n8n_albums WHERE album_id > ? ORDER BY album_id ASC LIMIT 1',
        [currentId]
    );

    return {
        prevId: prevRow?.album_id ?? null,
        nextId: nextRow?.album_id ?? null,
    };
};

export const getAdjacentStudios = async (currentId: number): Promise<{ prevId: number | null; nextId: number | null }> => {
    const [prevRow] = await query<Array<{ studio_id: number }>>(
        'SELECT studio_id FROM n8n_album_studios WHERE studio_id < ? ORDER BY studio_id DESC LIMIT 1',
        [currentId]
    );

    const [nextRow] = await query<Array<{ studio_id: number }>>(
        'SELECT studio_id FROM n8n_album_studios WHERE studio_id > ? ORDER BY studio_id ASC LIMIT 1',
        [currentId]
    );

    return {
        prevId: prevRow?.studio_id ?? null,
        nextId: nextRow?.studio_id ?? null,
    };
};

export const getModels = async (): Promise<AlbumModel[]> => {
    const rows = await query<any[]>(
        `SELECT 
            m.*,
            COUNT(a.album_id) as album_count
        FROM n8n_album_models m
        LEFT JOIN n8n_albums a ON m.model_id = a.model
        GROUP BY m.model_id
        ORDER BY m.model_name ASC`
    );

    return rows.map((row) => ({
        model_id: row.model_id,
        model_name: row.model_name,
        model_alias: row.model_alias,
        model_intro: row.model_intro,
        model_cover_url: row.model_cover_url,
        album_count: Number(row.album_count ?? 0),
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    }));
};

export const updateAlbum = async (
    albumId: number,
    data: {
        title?: string;
        model?: number;
        studio_id?: number;
        resource_url?: string;
        source_page_url?: string;
    }
) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
        updates.push('resource_title_cleaned = ?');
        values.push(data.title);
    }
    if (data.model !== undefined) {
        updates.push('model = ?');
        values.push(data.model);
    }
    if (data.studio_id !== undefined) {
        updates.push('studio_id = ?');
        values.push(data.studio_id);
    }
    if (data.resource_url !== undefined) {
        updates.push('resource_url = ?');
        values.push(data.resource_url);
    }
    if (data.source_page_url !== undefined) {
        updates.push('source_page_url = ?');
        values.push(data.source_page_url);
    }

    if (updates.length === 0) return;

    values.push(albumId);

    await query(
        `UPDATE n8n_albums SET ${updates.join(', ')}, updated_at = NOW() WHERE album_id = ?`,
        values
    );
};

export const createModel = async (name: string): Promise<number> => {
    const result = await query<any>(
        'INSERT INTO n8n_album_models (model_name, created_at, updated_at) VALUES (?, NOW(), NOW())',
        [name]
    );
    return result.insertId;
};

export const createAlbum = async (data: {
    title: string;
    model?: number;
    studio_id?: number;
    source_page_url?: string;
    resource_url?: string;
}): Promise<number> => {
    const result = await query<any>(
        `INSERT INTO n8n_albums (
            resource_title_raw, 
            resource_title_cleaned, 
            model, 
            studio_id, 
            source_page_url, 
            resource_url,
            created_at, 
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
            data.title,
            data.title, // Use title for both raw and cleaned initially
            data.model || null,
            data.studio_id || null,
            data.source_page_url || null,
            data.resource_url || `local://new-album-${Date.now()}-${Math.floor(Math.random() * 1000)}` // Generate unique URL
        ]
    );
    return result.insertId;
};
