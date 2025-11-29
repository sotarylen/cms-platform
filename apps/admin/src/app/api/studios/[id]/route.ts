import { NextRequest, NextResponse } from 'next/server';
import { updateStudio } from '@/lib/queries';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const resolvedParams = await params;
        const studioId = Number(resolvedParams.id);
        const body = await request.json();

        console.log(`[Studio Update API] Updating studio ${studioId}`, body);

        await updateStudio(studioId, {
            studio_intro: body.studio_intro,
            studio_cover_url: body.studio_cover_url,
        });

        return NextResponse.json({
            success: true,
            message: '工作室信息已更新',
        });
    } catch (error: any) {
        console.error('[Studio Update API] Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || '更新失败' },
            { status: 500 }
        );
    }
}
