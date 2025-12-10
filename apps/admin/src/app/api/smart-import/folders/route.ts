import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { smartParseFolderName } from '@/lib/album-import';
import { getAlbumImportPath } from '@/lib/config';

export async function GET(request: NextRequest) {
    try {
        // 获取动态导入路径
        const importPath = getAlbumImportPath();
        
        if (!fs.existsSync(importPath)) {
            return NextResponse.json({
                success: true,
                data: [],
                total: 0,
                importPath
            });
        }

        // 读取文件夹列表
        const entries = fs.readdirSync(importPath, { withFileTypes: true });
        const folders = entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
        
        // 智能解析每个文件夹
        const parsedFolders = folders.map(folder => ({
            folderName: folder,
            ...smartParseFolderName(folder)
        }));

        return NextResponse.json({
            success: true,
            data: parsedFolders,
            total: parsedFolders.length,
            importPath
        });
    } catch (error) {
        console.error('Smart import folders error:', error);
        return NextResponse.json(
            { success: false, error: '获取文件夹列表失败' },
            { status: 500 }
        );
    }
}