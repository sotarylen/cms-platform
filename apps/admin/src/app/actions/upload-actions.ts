'use server';

import { writeFile } from 'fs/promises';
import path from 'path';
import { getAlbumStoragePath } from '@/lib/config';
import { updateAlbum } from '@/lib/data/albums';
import { revalidatePath } from 'next/cache';

export async function uploadAlbumCoverAction(albumId: number, formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
        const storagePath = getAlbumStoragePath();
        const albumPath = path.join(storagePath, albumId.toString());
        const filePath = path.join(albumPath, filename);

        // Ensure directory exists (it should, but good to be safe)
        // fs.mkdirSync(albumPath, { recursive: true }); // Assuming album folder exists

        await writeFile(filePath, buffer);

        // Construct the URL (assuming standard API route for images)
        // Based on existing code: /api/images/albums/[albumId]/[filename]
        const coverUrl = `/api/images/albums/${albumId}/${filename}`;

        return { success: true, url: coverUrl };
    } catch (error) {
        console.error('Failed to upload cover:', error);
        return { success: false, error: 'Failed to upload cover' };
    }
}
