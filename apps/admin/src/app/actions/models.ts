'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';

/**
 * 更新模特信息
 */
export async function updateModelAction(
    modelId: number,
    data: {
        model_name?: string;
        model_alias?: string;
        model_intro?: string;
        model_cover_url?: string;
    }
) {
    try {
        const updates: string[] = [];
        const values: any[] = [];

        if (data.model_name !== undefined) {
            updates.push('model_name = ?');
            values.push(data.model_name);
        }
        if (data.model_alias !== undefined) {
            updates.push('model_alias = ?');
            values.push(data.model_alias);
        }
        if (data.model_intro !== undefined) {
            updates.push('model_intro = ?');
            values.push(data.model_intro);
        }
        if (data.model_cover_url !== undefined) {
            updates.push('model_cover_url = ?');
            values.push(data.model_cover_url);
        }

        if (updates.length === 0) {
            return { success: false, error: '没有要更新的字段' };
        }

        updates.push('updated_at = NOW()');
        values.push(modelId);

        await query(
            `UPDATE n8n_album_models SET ${updates.join(', ')} WHERE model_id = ?`,
            values
        );

        revalidatePath('/albums/models');
        revalidatePath(`/albums/models/${modelId}`);

        return { success: true };
    } catch (error) {
        console.error('Update model error:', error);
        return { success: false, error: '更新失败' };
    }
}

/**
 * 创建模特
 */
export async function createModelAction(data: {
    model_name: string;
    model_alias?: string;
    model_intro?: string;
    model_cover_url?: string;
}) {
    try {
        if (!data.model_name || data.model_name.trim() === '') {
            return { success: false, error: '模特名称不能为空' };
        }

        const result = await query<any>(
            `INSERT INTO n8n_album_models 
            (model_name, model_alias, model_intro, model_cover_url, created_at, updated_at) 
            VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [
                data.model_name.trim(),
                data.model_alias?.trim() || null,
                data.model_intro?.trim() || null,
                data.model_cover_url?.trim() || null
            ]
        );

        revalidatePath('/albums/models');

        return { success: true, modelId: result.insertId };
    } catch (error) {
        console.error('Create model error:', error);
        return { success: false, error: '创建失败' };
    }
}

/**
 * 删除模特
 */
export async function deleteModelAction(modelId: number) {
    try {
        // First unlink any albums associated with this model
        await query(
            'UPDATE n8n_albums SET model = NULL WHERE model = ?',
            [modelId]
        );

        // Then delete the model
        await query(
            'DELETE FROM n8n_album_models WHERE model_id = ?',
            [modelId]
        );

        revalidatePath('/albums/models');
        return { success: true };
    } catch (error) {
        console.error('Delete model error:', error);
        return { success: false, error: '删除失败' };
    }
}
