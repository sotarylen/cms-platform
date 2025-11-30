'use server';

import { updateAlbum, createModel } from '@/lib/data/albums';
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
            modelId = await createModel(data.model);
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
