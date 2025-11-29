'use server';

import { updateAlbumCover } from '@/lib/queries';
import { revalidatePath } from 'next/cache';

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
