'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getAlbumImageCount, getAlbumVideoCount } from '@/lib/album-images';

/**
 * 更新单个图册的图片和视频计数
 */
export async function updateAlbumCountsAction(albumId: number) {
    try {
        const imageCount = getAlbumImageCount(albumId);
        const videoCount = getAlbumVideoCount(albumId);

        await query(
            'UPDATE n8n_albums SET image_count = ?, video_count = ? WHERE album_id = ?',
            [imageCount, videoCount, albumId]
        );

        revalidatePath('/albums');
        revalidatePath(`/albums/${albumId}`);

        return { success: true, imageCount, videoCount };
    } catch (error) {
        console.error('Update album counts error:', error);
        return { success: false, error: '更新失败' };
    }
}

/**
 * 批量更新所有图册的计数（用于初始化）
 */
export async function updateAllAlbumCountsAction() {
    try {
        const albums = await query<any[]>('SELECT album_id FROM n8n_albums');

        let updated = 0;
        for (const album of albums) {
            const imageCount = getAlbumImageCount(album.album_id);
            const videoCount = getAlbumVideoCount(album.album_id);

            await query(
                'UPDATE n8n_albums SET image_count = ?, video_count = ? WHERE album_id = ?',
                [imageCount, videoCount, album.album_id]
            );
            updated++;
        }

        revalidatePath('/albums');

        return { success: true, updated };
    } catch (error) {
        console.error('Update all album counts error:', error);
        return { success: false, error: '批量更新失败' };
    }
}
