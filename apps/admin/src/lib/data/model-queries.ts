import { query } from '@/lib/db';
import { getAlbumImages, getAlbumVideos } from '@/lib/album-images';
import type { AlbumModel, Album } from '@/lib/types';

/**
 * 根据ID获取模特详情
 */
export const getModelById = async (modelId: number): Promise<AlbumModel | null> => {
    const rows = await query<any[]>(
        `SELECT 
            m.*,
            COUNT(a.album_id) as album_count
        FROM n8n_album_models m
        LEFT JOIN n8n_albums a ON m.model_id = a.model
        WHERE m.model_id = ?
        GROUP BY m.model_id`,
        [modelId]
    );

    const row = rows[0];
    if (!row) return null;

    return {
        model_id: row.model_id,
        model_name: row.model_name,
        model_alias: row.model_alias,
        model_intro: row.model_intro,
        model_cover_url: row.model_cover_url,
        album_count: Number(row.album_count ?? 0),
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    };
};

/**
 * 获取模特的图册列表（分页）
 */
export const getAlbumsByModel = async (
    modelId: number,
    options: { page?: number; pageSize?: number } = {}
): Promise<{ items: Album[]; total: number }> => {
    const { page = 1, pageSize = 30 } = options;
    const offset = (page - 1) * pageSize;

    // Get total count
    const countRows = await query<any[]>(
        'SELECT COUNT(*) as total FROM n8n_albums WHERE model = ?',
        [modelId]
    );
    const total = Number(countRows[0]?.total ?? 0);

    // Get albums
    const rows = await query<any[]>(
        `SELECT 
            a.*,
            s.studio_name,
            m.model_name
        FROM n8n_albums a
        LEFT JOIN n8n_album_studios s ON a.studio_id = s.studio_id
        LEFT JOIN n8n_album_models m ON a.model = m.model_id
        WHERE a.model = ?
        ORDER BY a.updated_at DESC
        LIMIT ? OFFSET ?`,
        [modelId, pageSize, offset]
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
            album_number: row.album_number || '',
            resource_title_raw: row.resource_title_raw,
            title: row.resource_title_cleaned || row.resource_title_raw,
            title_raw: row.title_raw,
            model: row.model,
            model_id: row.model,
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

/**
 * 获取相邻模特ID（用于上一个/下一个导航）
 */
export const getAdjacentModels = async (
    modelId: number
): Promise<{ prevId: number | null; nextId: number | null }> => {
    // Get previous model
    const prevRows = await query<any[]>(
        `SELECT model_id FROM n8n_album_models 
        WHERE model_id < ? 
        ORDER BY model_id DESC 
        LIMIT 1`,
        [modelId]
    );

    // Get next model
    const nextRows = await query<any[]>(
        `SELECT model_id FROM n8n_album_models 
        WHERE model_id > ? 
        ORDER BY model_id ASC 
        LIMIT 1`,
        [modelId]
    );

    return {
        prevId: prevRows[0]?.model_id || null,
        nextId: nextRows[0]?.model_id || null,
    };
};
