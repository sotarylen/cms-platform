'use server';

import fs from 'fs';
import path from 'path';
import { updateAlbum, createModel, createAlbum, getModels } from '@/lib/data/albums';
import { getAlbumStoragePath } from '@/lib/config';
import { uploadAlbumCoverAction } from '@/app/actions/upload-actions';
import { revalidatePath } from 'next/cache';

export async function updateAlbumAction(
    albumId: number,
    data: {
        title?: string;
        model?: number | string; // Allow string for new model name
        studio_id?: number;
        resource_url?: string;
        source_page_url?: string;
    }
) {
    try {
        let modelId = typeof data.model === 'number' ? data.model : undefined;

        // If model is a string, create a new model
        if (typeof data.model === 'string' && data.model.trim() !== '') {
            // Check if model exists to avoid duplicates
            const models = await getModels();
            const existingModel = models.find(m => m.name.toLowerCase() === (data.model as string).toLowerCase());

            if (existingModel) {
                modelId = existingModel.id;
            } else {
                modelId = await createModel(data.model);
            }
        }

        await updateAlbum(albumId, {
            ...data,
            model: modelId,
        });
        revalidatePath(`/albums/${albumId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to update album:', error);
        return { success: false, error: 'Failed to update album' };
    }
}

export async function createAlbumAction(data: {
    title: string;
    model?: string;
    studio_id?: number;
    source_page_url?: string;
}, coverFormData?: FormData) {
    try {
        if (!data.title || data.title.trim() === '') {
            return { success: false, error: '标题不能为空' };
        }

        let modelId: number | undefined;

        if (data.model && data.model.trim() !== '') {
            // Check if model exists
            const models = await getModels();
            const existingModel = models.find(m => m.name.toLowerCase() === data.model!.toLowerCase());

            if (existingModel) {
                modelId = existingModel.id;
            } else {
                modelId = await createModel(data.model);
            }
        }

        const albumId = await createAlbum({
            title: data.title,
            model: modelId,
            studio_id: data.studio_id,
            source_page_url: data.source_page_url,
        });

        // Create folder
        try {
            const storagePath = getAlbumStoragePath();
            if (storagePath) {
                const albumPath = path.join(storagePath, albumId.toString());
                if (!fs.existsSync(albumPath)) {
                    fs.mkdirSync(albumPath, { recursive: true });
                }
            }
        } catch (err) {
            console.error('Failed to create album folder:', err);
            // Don't fail the request, just log error
        }

        // Upload cover if provided
        if (coverFormData) {
            const uploadResult = await uploadAlbumCoverAction(albumId, coverFormData);
            if (uploadResult.success && uploadResult.url) {
                await updateAlbum(albumId, { source_page_url: uploadResult.url });
            } else {
                console.error('Cover upload failed:', uploadResult.error);
            }
        }

        revalidatePath('/albums');
        return { success: true, albumId };
    } catch (error) {
        console.error('Failed to create album:', error);
        return { success: false, error: '创建失败' };
    }
}

export async function deleteAlbumAction(albumId: number) {
    try {
        const { query } = await import('@/lib/db');

        // Delete album from database
        await query('DELETE FROM n8n_albums WHERE album_id = ?', [albumId]);

        // Delete album folder if it exists
        try {
            const storagePath = getAlbumStoragePath();
            if (storagePath) {
                const albumPath = path.join(storagePath, albumId.toString());
                if (fs.existsSync(albumPath)) {
                    fs.rmSync(albumPath, { recursive: true, force: true });
                }
            }
        } catch (err) {
            console.error('Failed to delete album folder:', err);
            // Don't fail the request, just log error
        }

        revalidatePath('/albums');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete album:', error);
        return { success: false, error: '删除失败' };
    }
}
