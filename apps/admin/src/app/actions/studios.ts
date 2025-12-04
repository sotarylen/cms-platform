'use server';

import { createStudio as dbCreateStudio } from '@/lib/data/albums';
import { revalidatePath } from 'next/cache';

export async function createStudio(data: {
    studio_name: string;
    studio_intro?: string;
    studio_cover_url?: string;
}): Promise<{ success: boolean; error?: string; studioId?: number }> {
    try {
        if (!data.studio_name || !data.studio_name.trim()) {
            return { success: false, error: '机构名称不能为空' };
        }

        const studioId = await dbCreateStudio({
            studio_name: data.studio_name.trim(),
            studio_intro: data.studio_intro?.trim() || undefined,
            studio_cover_url: data.studio_cover_url?.trim() || undefined,
        });

        // 重新验证相关页面缓存
        revalidatePath('/albums/studios');

        return { success: true, studioId };
    } catch (error) {
        console.error('Error creating studio:', error);
        return { success: false, error: '创建失败，请稍后重试' };
    }
}
