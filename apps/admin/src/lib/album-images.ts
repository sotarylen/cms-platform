import fs from 'fs';
import path from 'path';
import { getAlbumStoragePath } from './config';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.mkv', '.avi', '.flv', '.wmv', '.ogg', '.3gp', '.m4v', '.ts'];

/**
 * 递归获取目录下的所有视频文件
 * @param dirPath 目录路径
 * @param basePath 基础路径（用于生成相对路径）
 * @returns 视频文件名数组（仅文件名）
 */
function getVideosRecursively(dirPath: string, basePath: string): string[] {
    const videos: string[] = [];

    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                // 递归搜索子目录，但返回的文件名不包含子目录路径
                const subVideos = getVideosRecursively(fullPath, basePath);
                videos.push(...subVideos);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (VIDEO_EXTENSIONS.includes(ext)) {
                    // 只返回文件名，不包含子目录路径
                    videos.push(entry.name);
                }
            }
        }
    } catch (error) {
        console.error(`Failed to read directory ${dirPath}:`, error);
    }

    return videos;
}

/**
 * 获取图册的视频列表（递归搜索所有子文件夹）
 * @param albumId 图册ID
 * @returns 视频文件名数组（仅文件名，已排序）
 */
export function getAlbumVideos(albumId: number): string[] {
    try {
        const basePath = getAlbumStoragePath();
        const albumPath = path.join(basePath, albumId.toString());

        // 检查文件夹是否存在
        if (!fs.existsSync(albumPath)) {
            return [];
        }

        // 递归获取所有视频文件，只返回文件名
        const videoFiles = getVideosRecursively(albumPath, albumPath);

        // 排序
        videoFiles.sort((a, b) => {
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });

        return videoFiles;
    } catch (error) {
        console.error(`Failed to read album videos for ${albumId}:`, error);
        return [];
    }
}

/**
 * 递归获取目录下的所有图片文件
 * @param dir 目录路径
 * @param basePath 基础路径（用于计算相对路径）
 * @returns 图片文件相对路径数组
 */
function getImagesRecursive(dir: string, basePath: string): string[] {
    const results: string[] = [];

    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                // 递归读取子文件夹
                results.push(...getImagesRecursive(fullPath, basePath));
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (IMAGE_EXTENSIONS.includes(ext)) {
                    // 计算相对于基础路径的相对路径
                    const relativePath = path.relative(basePath, fullPath);
                    results.push(relativePath);
                }
            }
        }
    } catch (error) {
        console.error(`Failed to read directory ${dir}:`, error);
    }

    return results;
}

/**
 * 获取图册的图片列表（递归读取所有子文件夹）
 * @param albumId 图册ID
 * @returns 图片文件名数组（仅文件名，已排序）
 */
export function getAlbumImages(albumId: number): string[] {
    try {
        const basePath = getAlbumStoragePath();
        const albumPath = path.join(basePath, albumId.toString());

        // 检查文件夹是否存在
        if (!fs.existsSync(albumPath)) {
            return [];
        }

        // 递归获取所有图片，只返回文件名
        const imageFiles = getImagesRecursive(albumPath, albumPath);

        // 排序
        imageFiles.sort((a, b) => {
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

/**
 * 获取视频总数
 */
export function getAlbumVideoCount(albumId: number): number {
    return getAlbumVideos(albumId).length;
}
