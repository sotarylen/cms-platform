import fs from 'fs';
import path from 'path';
import { getAlbumStoragePath } from './config';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];

/**
 * 获取图册的图片列表
 * @param albumId 图册ID
 * @returns 图片文件名数组（已排序）
 */
export function getAlbumImages(albumId: number): string[] {
    try {
        const basePath = getAlbumStoragePath();
        const albumPath = path.join(basePath, albumId.toString());

        // 检查文件夹是否存在
        if (!fs.existsSync(albumPath)) {
            return [];
        }

        // 读取文件夹内容
        const files = fs.readdirSync(albumPath);

        // 过滤图片文件并排序
        const imageFiles = files
            .filter((file) => {
                const ext = path.extname(file).toLowerCase();
                return IMAGE_EXTENSIONS.includes(ext);
            })
            .sort((a, b) => {
                return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
            });

        return imageFiles;
    } catch (error) {
        console.error(`Failed to read album images for ${albumId}:`, error);
        return [];
    }
}

/**
 * 检查图册文件夹是否存在
 */
export function albumFolderExists(albumId: number): boolean {
    try {
        const basePath = getAlbumStoragePath();
        const albumPath = path.join(basePath, albumId.toString());
        return fs.existsSync(albumPath);
    } catch (error) {
        return false;
    }
}

/**
 * 获取图片总数
 */
export function getAlbumImageCount(albumId: number): number {
    return getAlbumImages(albumId).length;
}
