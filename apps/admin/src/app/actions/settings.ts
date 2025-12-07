'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/session';
import {
    getSettings,
    saveWebhook,
    deleteWebhook,
    setAlbumStoragePath,
    setAlbumImportPath,
} from '@/lib/config';
import type { WebhookConfig } from '@/lib/types';

export async function getSettingsAction() {
    try {
        await requireAdmin();
        const settings = getSettings();
        return { success: true, data: settings };
    } catch (error) {
        return { success: false, error: '权限不足' };
    }
}

export async function saveWebhookAction(webhook: WebhookConfig) {
    try {
        await requireAdmin();
        saveWebhook(webhook);
        revalidatePath('/admin/n8n-api');
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error('Save webhook error:', error);
        return { success: false, error: '保存失败' };
    }
}

export async function deleteWebhookAction(id: string) {
    try {
        await requireAdmin();
        deleteWebhook(id);
        revalidatePath('/admin/n8n-api');
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error('Delete webhook error:', error);
        return { success: false, error: '删除失败' };
    }
}

export async function updateAlbumStoragePathAction(path: string) {
    try {
        await requireAdmin();

        if (!path || path.trim() === '') {
            return { success: false, error: '路径不能为空' };
        }

        setAlbumStoragePath(path);
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error('Update storage path error:', error);
        return { success: false, error: '保存失败' };
    }
}

export async function updateAlbumImportPathAction(path: string) {
    try {
        await requireAdmin();

        if (!path || path.trim() === '') {
            return { success: false, error: '路径不能为空' };
        }

        setAlbumImportPath(path);
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error('Update import path error:', error);
        return { success: false, error: '保存失败' };
    }
}
