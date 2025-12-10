'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { parseFolderName, getImportFolders, getImportFolderPath } from '@/lib/album-import';
import { findOrCreateStudio, findOrCreateModel } from '@/lib/data/album-helpers';
import { createAlbum } from '@/lib/data/albums';
import { getAlbumStoragePath } from '@/lib/config';

export interface SmartImportItem {
    folderName: string;
    studio: string;
    model: string;
    title: string;
}

/**
 * 获取文件夹列表的服务器端函数
 */
export async function getImportFoldersAction(): Promise<string[]> {
    return getImportFolders();
}

/**
 * 单个导入结果
 */
export interface ImportResult {
    folder: string;
    status: 'success' | 'skipped' | 'failed';
    reason?: string;
    albumId?: number;
    studio?: string;
    model?: string;
    title?: string;
}

/**
 * 导入汇总结果
 */
export interface ImportSummary {
    success: boolean;
    total: number;
    imported: number;
    skipped: number;
    failed: number;
    details: ImportResult[];
}

/**
 * 移动文件夹到存储目录
 * @param sourcePath 源路径
 * @param albumId 图册ID
 * @returns 是否成功
 */
async function moveFolderToStorage(sourcePath: string, albumId: number): Promise<boolean> {
    try {
        const storagePath = getAlbumStoragePath();
        const targetPath = path.join(storagePath, albumId.toString());

        // 确保存储目录存在
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath, { recursive: true });
        }

        // 如果目标已存在，先删除
        if (fs.existsSync(targetPath)) {
            fs.rmSync(targetPath, { recursive: true, force: true });
        }

        // 确保目标目录存在
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // 移动文件夹
        fs.renameSync(sourcePath, targetPath);

        // 验证移动是否成功
        if (!fs.existsSync(targetPath)) {
            console.error('Folder move verification failed');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error moving folder:', error);
        return false;
    }
}

/**
 * 处理单个文件夹的导入
 * 使用完整文件夹名称作为图册标题，同时解析工作室和模特信息
 * @param folderName 文件夹名称（完整名称作为标题）
 * @param metadata 可选的元数据，如果提供则跳过解析
 * @returns 导入结果
 */
async function importSingleFolder(folderName: string, metadata?: SmartImportItem): Promise<ImportResult> {
    const folderPath = getImportFolderPath(folderName);

    // 如果没有提供元数据，则尝试解析
    let studio = metadata?.studio || '';
    let model = metadata?.model || '';
    let title = metadata?.title || folderName;

    // 只有在没有元数据且未提供工作室的情况下才进行解析
    if (!metadata) {
        const parsed = parseFolderName(folderName);
        if (!parsed.valid) {
            return {
                folder: folderName,
                status: 'failed',
                reason: parsed.error || '文件夹名称格式错误'
            };
        }
        studio = parsed.studio;
        model = parsed.model;
        title = folderName; // 始终使用完整文件夹名称
    }

    try {
        // 查找或创建工作室
        const studioId = await findOrCreateStudio(studio);

        // 查找或创建模特（可能为null）
        const modelId = await findOrCreateModel(model);

        // 创建图册记录，使用完整文件夹名称作为标题
        const albumId = await createAlbum({
            title: title,
            model: modelId || undefined,
            studio_id: studioId,
            source_page_url: undefined,
            resource_url: `local://imported-${Date.now()}-${Math.random().toString(36).substring(7)}`
        });

        // 移动文件夹
        const moved = await moveFolderToStorage(folderPath, albumId);
        if (!moved) {
            // 如果移动失败，这里可以选择删除数据库记录
            // 但为了简化，我们只记录失败
            return {
                folder: folderName,
                status: 'failed',
                reason: '文件夹移动失败',
                albumId,
                studio: studio,
                model: model,
                title: title
            };
        }

        return {
            folder: folderName,
            status: 'success',
            albumId,
            studio: studio,
            model: model,
            title: title
        };
    } catch (error) {
        console.error('Error importing folder:', error);
        return {
            folder: folderName,
            status: 'failed',
            reason: error instanceof Error ? error.message : '未知错误'
        };
    }
}

/**
 * 导入所有待处理的图册
 * 使用批量处理，每批10个
 * @returns 导入结果汇总
 */
export async function importAlbumsAction(): Promise<ImportSummary> {
    try {
        // 获取所有待导入的文件夹
        const folders = getImportFolders();

        if (folders.length === 0) {
            return {
                success: true,
                total: 0,
                imported: 0,
                skipped: 0,
                failed: 0,
                details: []
            };
        }

        const details: ImportResult[] = [];
        const BATCH_SIZE = 10;

        // 批量处理
        for (let i = 0; i < folders.length; i += BATCH_SIZE) {
            const batch = folders.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.all(
                batch.map(folder => importSingleFolder(folder))
            );
            details.push(...batchResults);
        }

        // 统计结果
        const imported = details.filter(d => d.status === 'success').length;
        const skipped = details.filter(d => d.status === 'skipped').length;
        const failed = details.filter(d => d.status === 'failed').length;

        // 刷新图册列表页面
        revalidatePath('/albums');

        return {
            success: true,
            total: folders.length,
            imported,
            skipped,
            failed,
            details
        };
    } catch (error) {
        console.error('Error in importAlbumsAction:', error);
        return {
            success: false,
            total: 0,
            imported: 0,
            skipped: 0,
            failed: 0,
            details: []
        };
    }
}

/**
 * 导入指定的图册（智能导入）
 */
export async function importSelectedAlbumsAction(items: SmartImportItem[]): Promise<ImportSummary> {
    try {
        if (items.length === 0) {
            return {
                success: true,
                total: 0,
                imported: 0,
                skipped: 0,
                failed: 0,
                details: []
            };
        }

        const details: ImportResult[] = [];
        const BATCH_SIZE = 10;

        // 批量处理
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
            const batch = items.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.all(
                batch.map(item => importSingleFolder(item.folderName, item))
            );
            details.push(...batchResults);
        }

        // 统计结果
        const imported = details.filter(d => d.status === 'success').length;
        const skipped = details.filter(d => d.status === 'skipped').length;
        const failed = details.filter(d => d.status === 'failed').length;

        // 刷新图册列表页面
        revalidatePath('/albums');

        return {
            success: true,
            total: items.length,
            imported,
            skipped,
            failed,
            details
        };
    } catch (error) {
        console.error('Error in importSelectedAlbumsAction:', error);
        return {
            success: false,
            total: 0,
            imported: 0,
            skipped: 0,
            failed: 0,
            details: []
        };
    }
}
