import { query } from '@/lib/db';

/**
 * 根据名称查找工作室，如果不存在则创建
 * @param name 工作室名称
 * @returns 工作室ID
 */
export const findOrCreateStudio = async (name: string): Promise<number> => {
    if (!name || name.trim() === '') {
        throw new Error('工作室名称不能为空');
    }

    const trimmedName = name.trim();

    // 先查找是否存在
    const rows = await query<any[]>(
        'SELECT studio_id FROM n8n_album_studios WHERE studio_name = ? LIMIT 1',
        [trimmedName]
    );

    if (rows.length > 0) {
        return rows[0].studio_id;
    }

    // 不存在则创建
    try {
        const result = await query<any>(
            `INSERT INTO n8n_album_studios 
            (studio_name, studio_intro, studio_cover_url, created_at, updated_at) 
            VALUES (?, ?, ?, NOW(), NOW())`,
            [
                trimmedName,
                trimmedName, // 使用工作室名称作为简介
                null // 不使用占位图，避免 404 错误
            ]
        );
        return result.insertId;
    } catch (error: any) {
        // 如果是重复键错误（并发创建），再次查询
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            const retryRows = await query<any[]>(
                'SELECT studio_id FROM n8n_album_studios WHERE studio_name = ? LIMIT 1',
                [trimmedName]
            );
            if (retryRows.length > 0) {
                return retryRows[0].studio_id;
            }
        }
        throw error;
    }
};

/**
 * 根据名称查找模特，如果不存在则创建
 * @param name 模特名称（可以为空）
 * @returns 模特ID，如果名称为空则返回null
 */
export const findOrCreateModel = async (name: string): Promise<number | null> => {
    if (!name || name.trim() === '') {
        return null;
    }

    const trimmedName = name.trim();

    // 先查找是否存在
    const rows = await query<any[]>(
        'SELECT model_id FROM n8n_album_models WHERE model_name = ? LIMIT 1',
        [trimmedName]
    );

    if (rows.length > 0) {
        return rows[0].model_id;
    }

    // 不存在则创建
    try {
        const result = await query<any>(
            'INSERT INTO n8n_album_models (model_name, created_at, updated_at) VALUES (?, NOW(), NOW())',
            [trimmedName]
        );
        return result.insertId;
    } catch (error: any) {
        // 如果是重复键错误（并发创建），再次查询
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            const retryRows = await query<any[]>(
                'SELECT model_id FROM n8n_album_models WHERE model_name = ? LIMIT 1',
                [trimmedName]
            );
            if (retryRows.length > 0) {
                return retryRows[0].model_id;
            }
        }
        throw error;
    }
};
