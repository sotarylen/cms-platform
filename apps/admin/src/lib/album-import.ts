import fs from 'fs';
import path from 'path';
import { getAlbumImportPath } from './config';

/**
 * 解析后的文件夹信息
 */
export interface ParsedFolderName {
    studio: string;
    model: string;
    title: string;
    valid: boolean;
    error?: string;
}

/**
 * 解析文件夹名称
 * 格式：[工作室][模特]图册名称
 * 示例：[MetArt][Emma]Summer Dreams
 * 示例：[X-Art][]Sunset Collection (模特为空)
 * 
 * @param folderName 文件夹名称
 * @returns 解析结果
 */
export function parseFolderName(folderName: string): ParsedFolderName {
    // 匹配前两个中括号
    const regex = /^\[([^\]]*)\]\[([^\]]*)\](.+)$/;
    const match = folderName.match(regex);

    if (!match) {
        return {
            studio: '',
            model: '',
            title: '',
            valid: false,
            error: '文件夹名称格式错误，应为：[工作室][模特]图册名称'
        };
    }

    const studio = match[1].trim();
    const model = match[2].trim();
    const title = match[3].trim();

    // 工作室和标题必须存在
    if (!studio) {
        return {
            studio,
            model,
            title,
            valid: false,
            error: '工作室名称不能为空'
        };
    }

    if (!title) {
        return {
            studio,
            model,
            title,
            valid: false,
            error: '图册标题不能为空'
        };
    }

    return {
        studio,
        model: model || '', // 模特可以为空
        title,
        valid: true
    };
}

/**
 * 获取导入目录下的所有子文件夹
 * @returns 文件夹名称数组
 */
export function getImportFolders(): string[] {
    const importPath = getAlbumImportPath();

    if (!fs.existsSync(importPath)) {
        return [];
    }

    try {
        const entries = fs.readdirSync(importPath, { withFileTypes: true });
        return entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
    } catch (error) {
        console.error('Error reading import directory:', error);
        return [];
    }
}

/**
 * 验证文件夹是否包含有效的图片或视频文件
 * @param folderPath 文件夹绝对路径
 * @returns 是否包含有效文件
 */
export function validateFolderContent(folderPath: string): boolean {
    if (!fs.existsSync(folderPath)) {
        return false;
    }

    try {
        const files = fs.readdirSync(folderPath);
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.mkv'];

        return files.some(file => {
            const ext = path.extname(file).toLowerCase();
            return validExtensions.includes(ext);
        });
    } catch (error) {
        console.error('Error validating folder content:', error);
        return false;
    }
}

/**
 * 获取文件夹的完整路径
 * @param folderName 文件夹名称
 * @returns 完整路径
 */
export function getImportFolderPath(folderName: string): string {
    const importPath = getAlbumImportPath();
    return path.join(importPath, folderName);
}
