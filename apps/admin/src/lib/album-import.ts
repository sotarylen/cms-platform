import { getAlbumImportPath } from './config';
import fs from 'fs';
import path from 'path';

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
 * 智能解析结果接口
 */
export interface SmartParsedFolderName {
    studio: string;
    model: string;
    title: string; // 完整文件夹名称作为标题
    confidence: {
        studio: number; // 0-100
        model: number;  // 0-100
        overall: number; // 0-100
    };
    method: string; // 使用的解析方法
    valid: boolean;
    error?: string;
}

/**
 * 智能解析文件夹名称
 * 支持多种格式的文件夹命名，自动提取摄影机构和模特信息
 * @param folderName 文件夹名称
 * @returns 智能解析结果
 */
export function smartParseFolderName(folderName: string): SmartParsedFolderName {
    console.log('智能解析文件夹:', folderName);

    // 首先尝试传统格式解析
    const traditionalResult = parseFolderName(folderName);
    if (traditionalResult.valid) {
        return {
            studio: traditionalResult.studio,
            model: traditionalResult.model,
            title: folderName, // 使用完整文件夹名称作为标题
            confidence: {
                studio: 90,
                model: 85,
                overall: 88
            },
            method: 'traditional-bracket',
            valid: true
        };
    }

    // 智能解析逻辑
    let studio = '';
    let model = '';
    let confidence = { studio: 0, model: 0, overall: 0 };
    let method = 'smart-analysis';

    try {
        // 预处理：提取所有方括号内容
        const allBrackets = folderName.match(/\[([^\]]+)\]/g);
        const bracketContents: { text: string, index: number, used: boolean }[] = [];

        if (allBrackets) {
            allBrackets.forEach((b) => {
                const content = b.replace(/[\[\]]/g, '').trim();
                // 过滤掉明显不是工作室/模特的标记
                if (isValidNameContent(content)) {
                    bracketContents.push({
                        text: content,
                        index: folderName.indexOf(b),
                        used: false
                    });
                }
            });
        }

        // 策略1：基于方括号的解析
        if (bracketContents.length > 0) {
            // 假设第一个有效的方括号内容是工作室
            studio = bracketContents[0].text;
            bracketContents[0].used = true;
            confidence.studio = 90;

            // 如果还有其他方括号，可能是模特
            const unusedBrackets = bracketContents.filter(b => !b.used);
            if (unusedBrackets.length > 0) {
                // 通常紧跟在工作室后面的是模特
                model = unusedBrackets[0].text;
                unusedBrackets[0].used = true;
                confidence.model = 85;
            }
        }

        // 策略2：如果方括号没找到完整信息，尝试分隔符解析 (hyphen/underscore/at)
        // 只有当没有找到工作室 OR 没有找到模特时才尝试
        if (!studio || !model) {
            // 常见的分割符： " - ", "_", "@"
            if (folderName.includes('@')) {
                // Format: Model @ Studio
                const parts = folderName.split('@');
                if (parts.length === 2) {
                    const part1 = parts[0].trim();
                    const part2 = parts[1].trim();
                    // 如果之前没找到，才覆盖
                    if (!model && isValidNameContent(part1)) {
                        model = part1;
                        confidence.model = 70;
                    }
                    if (!studio && isValidNameContent(part2)) {
                        studio = part2;
                        confidence.studio = 70;
                    }
                    method = 'separator-at';
                }
            } else if (folderName.includes(' - ')) {
                // Format: Studio - Model - Title or Date - Studio - Model
                const parts = folderName.split(' - ').map(p => p.trim());
                // 过滤掉日期
                const validParts = parts.filter(p => !/^\d{4}[.-]\d{2}[.-]\d{2}$/.test(p));

                if (validParts.length >= 2) {
                    // 如果目前什么都没找到，假设前两个是 Studio 和 Model
                    // 这里需要更智能一点：区分哪种格式
                    // 假设 Studio 通常在 Model 前面，除非有明确特征

                    // Case: Studio - Model - Title
                    if (!studio && isValidNameContent(validParts[0])) {
                        studio = validParts[0];
                        confidence.studio = 60;
                    }
                    if (!model && isValidNameContent(validParts[1])) {
                        model = validParts[1];
                        confidence.model = 60;
                    }
                    method = 'separator-hyphen';
                }
            }
        }

        // 策略3：如果找到了工作室，但没找到模特，尝试从剩余文本中提取
        // 只在确定了工作室的情况下尝试文本提取，避免误判标题为模特
        if (studio && !model) {
            // 移除所有已识别的方括号内容
            let cleanText = folderName;
            // 移除工作室
            cleanText = cleanText.replace(`[${studio}]`, '').replace(studio, '');
            // 移除其他无关方括号
            cleanText = cleanText.replace(/\[[^\]]+\]/g, ' ').trim();

            // 移除开头的日期格式 (如 2024.05.20)
            cleanText = cleanText.replace(/^\d{4}[.-]\d{2}[.-]\d{2}[-\s]*/, '');
            // 移除开头的编号 (如 NO.123)
            cleanText = cleanText.replace(/^NO\.\d+[-\s]*/i, '');
            // 移除分隔符
            cleanText = cleanText.replace(/^[\s\-_]+|[\s\-_]+$/g, '');

            console.log('用于提取模特的清理后文本:', cleanText);

            // 尝试提取可能的模特名称
            // 1. 尝试 "Model Name" 格式 (驼峰或空格分隔)
            const possibleNames = extractPotentialNames(cleanText);
            if (possibleNames.length > 0) {
                // 如果找到的名称和工作室不一样
                const candidate = possibleNames[0];
                if (candidate && candidate.toLowerCase() !== studio.toLowerCase()) {
                    model = candidate;
                    confidence.model = 60; // 文本提取置信度较低
                }
            }
        }

        // 最终修正
        if (model === studio) {
            model = ''; // 避免自我捕获
            confidence.model = 0;
        }

        // 计算总体置信度
        const overallConfidence = Math.round((confidence.studio + confidence.model) / 2);

        return {
            studio,
            model,
            title: folderName,
            confidence: {
                studio: confidence.studio,
                model: confidence.model,
                overall: overallConfidence
            },
            method,
            valid: true
        };

    } catch (error) {
        console.error('智能解析出错:', error);
        return {
            studio: '',
            model: '',
            title: folderName,
            confidence: { studio: 0, model: 0, overall: 0 },
            method: 'error',
            valid: false,
            error: '解析过程中发生错误'
        };
    }
}

/**
 * 检查文本内容是否像是有效的工作室或模特名称
 */
function isValidNameContent(content: string): boolean {
    if (!content) return false;
    // 排除纯数字
    if (/^\d+$/.test(content)) return false;
    // 排除日期
    if (/^\d+[.-]\d+[.-]\d+$/.test(content)) return false;

    // 排除图片/视频数量统计和文件大小
    // 匹配如: 100P, 100P+2V, 29P+1V328M, 1.2GB, 4K, 1080p
    const techSpecsRegex = /^(\d+(\.\d+)?[A-Z]+(\+\d+(\.\d+)?[A-Z]+)*)+$/i;
    // 100P+2V300M 这种混合格式
    const mixedSpecsRegex = /^(\d+[A-Z]+)+(\+\d+[A-Z]+)*$/i;

    if (techSpecsRegex.test(content) || mixedSpecsRegex.test(content)) return false;

    // 排除带有 MB, GB 的
    if (/\d+(MB|GB|K|M)/i.test(content)) return false;

    // 排除编号
    if (/^NO\.\d+$/i.test(content)) return false;
    // 长度限制
    if (content.length < 2) return false;

    return true;
}

/**
 * 从文本中提取潜在的人名
 */
function extractPotentialNames(text: string): string[] {
    const names: string[] = [];

    // 1. 中文名 (2-8个汉字)
    const exactChinese = text.match(/^([一-龯]{2,8})(\s|$)/);
    if (exactChinese) names.push(exactChinese[1]);

    // 2. 英文名 (开头大写)
    // 匹配 "Name" 或 "First Last"
    const englishName = text.match(/^([A-Z][a-z]+(\s[A-Z][a-z]+)?)/);
    if (englishName) names.push(englishName[1]);

    // 3. 如果只是一个单词 (且不包含奇怪符号)
    if (!names.length) {
        const firstWord = text.split(/[\s\-_]/)[0];
        if (isValidNameContent(firstWord) && /^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(firstWord)) {
            names.push(firstWord);
        }
    }

    return names;
}

/**
 * 解析文件夹名称
 * 格式：[工作室][模特] 或 [工作室][模特]图册名称
 * 示例：[MetArt][Emma]Summer Dreams
 * 示例：[X-Art][]Sunset Collection (模特为空)
 * 示例：[MetArt][Emma] (仅工作室和模特，使用完整名称作为标题)
 *
 * @param folderName 文件夹名称
 * @returns 解析结果
 */
export function parseFolderName(folderName: string): ParsedFolderName {
    // 匹配格式：[工作室][模特] 或 [工作室][模特]图册名称
    const regex = /^\[([^\]]*)\]\[([^\]]*)\](.*)$/;
    const match = folderName.match(regex);

    // 调试输出
    // console.log('解析文件夹名称:', folderName, '匹配结果:', match);

    if (!match) {
        return {
            studio: '',
            model: '',
            title: '',
            valid: false,
            error: '文件夹名称格式错误，应为：[工作室][模特]或[工作室][模特]图册名称'
        };
    }

    const studio = match[1].trim();
    const model = match[2].trim();
    const title = match[3].trim();

    // 工作室必须存在
    if (!studio) {
        return {
            studio,
            model,
            title,
            valid: false,
            error: '工作室名称不能为空'
        };
    }

    // 如果没有标题部分，使用完整文件夹名称作为标题
    const finalTitle = title || folderName;

    // console.log('解析结果:', { studio, model, title: finalTitle });

    return {
        studio,
        model: model || '', // 模特可以为空
        title: finalTitle,
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
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.ogg', '.3gp', '.m4v', '.ts'];

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
