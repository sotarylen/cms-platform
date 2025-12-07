import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { getAlbumStoragePath } from '@/lib/config';

export async function POST(request: NextRequest) {
    try {
        const { albumId, filename, rotation } = await request.json();

        console.log('[Rotate API] Received request:', { albumId, filename, rotation });

        if (!albumId || !filename || rotation === undefined) {
            console.error('[Rotate API] Missing parameters');
            return NextResponse.json(
                { error: 'Missing albumId, filename, or rotation' },
                { status: 400 }
            );
        }

        const storagePath = getAlbumStoragePath();
        const fullPath = join(storagePath, String(albumId), filename);

        console.log('[Rotate API] Full path:', fullPath);

        // Read the image
        const imageBuffer = await readFile(fullPath);
        console.log('[Rotate API] Image read successfully, size:', imageBuffer.length);

        // Rotate the image using sharp
        let rotatedBuffer = imageBuffer;
        if (rotation !== 0) {
            rotatedBuffer = await sharp(imageBuffer)
                .rotate(rotation)
                .toBuffer();
            console.log('[Rotate API] Image rotated, new size:', rotatedBuffer.length);
        }

        // Write the rotated image back
        await writeFile(fullPath, rotatedBuffer);
        console.log('[Rotate API] Image saved successfully');

        return NextResponse.json({
            success: true,
            message: 'Image rotated successfully'
        });
    } catch (error) {
        console.error('[Rotate API] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to rotate image',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
