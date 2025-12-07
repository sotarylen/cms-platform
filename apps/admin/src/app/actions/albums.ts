'use server';

import { updateAlbumCover } from '@/lib/data/albums';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { getAlbumStoragePath } from '@/lib/config';

export async function setAlbumCover(albumId: number, coverUrl: string) {
    try {
        await updateAlbumCover(albumId, coverUrl);
        revalidatePath('/albums');
        revalidatePath(`/albums/${albumId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to set album cover:', error);
        return { success: false, error: 'Failed to set album cover' };
    }
}

export async function deleteAlbumImage(albumId: number, filename: string) {
    try {
        const storagePath = getAlbumStoragePath();
        const albumPath = path.join(storagePath, albumId.toString());
        const filePath = path.join(albumPath, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return { success: false, error: '文件不存在' };
        }

        // Delete the file
        fs.unlinkSync(filePath);

        revalidatePath(`/albums/${albumId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to delete image:', error);
        return { success: false, error: '删除失败' };
    }
}
