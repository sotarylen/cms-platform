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

export async function uploadStudioLogo(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `studio-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        // Store in a public directory for studio logos
        const publicPath = path.join(process.cwd(), 'public', 'uploads', 'studios');

        // Ensure directory exists
        const fs = require('fs');
        if (!fs.existsSync(publicPath)) {
            fs.mkdirSync(publicPath, { recursive: true });
        }

        const filePath = path.join(publicPath, filename);
        await writeFile(filePath, buffer);

        // Return public URL
        const logoUrl = `/uploads/studios/${filename}`;

        return { success: true, url: logoUrl };
    } catch (error) {
        console.error('Failed to upload studio logo:', error);
        return { success: false, error: 'Failed to upload logo' };
    }
}
