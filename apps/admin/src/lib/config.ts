import fs from 'fs';
import path from 'path';
import type { Settings, WebhookConfig } from './types';

const CONFIG_PATH = path.join(process.cwd(), 'config', 'settings.json');

// 默认配置
const DEFAULT_SETTINGS: Settings = {
    webhooks: [],
    albumStoragePath: '/Users/sotary/albums',
    albumImportPath: '/Users/sotary/albums-import',
};

/**
 * 确保配置文件存在
 */
function ensureConfigFile() {
    const configDir = path.dirname(CONFIG_PATH);

    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }

    if (!fs.existsSync(CONFIG_PATH)) {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
    }
}

/**
 * 读取配置
 */
export function getSettings(): Settings {
    try {
        ensureConfigFile();
        const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
        return JSON.parse(data) as Settings;
    } catch (error) {
        console.error('Failed to read settings:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * 保存配置
 */
export function saveSettings(settings: Settings): void {
    try {
        ensureConfigFile();
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(settings, null, 2), 'utf-8');
    } catch (error) {
        console.error('Failed to save settings:', error);
        throw new Error('保存配置失败');
    }
}

/**
 * 获取所有 Webhook 配置
 */
export function getWebhooks(): WebhookConfig[] {
    const settings = getSettings();
    return settings.webhooks;
}

/**
 * 根据 ID 获取 Webhook
 */
export function getWebhookById(id: string): WebhookConfig | null {
    const webhooks = getWebhooks();
    return webhooks.find((w) => w.id === id) || null;
}

/**
 * 添加或更新 Webhook
 */
export function saveWebhook(webhook: WebhookConfig): void {
    const settings = getSettings();
    const index = settings.webhooks.findIndex((w) => w.id === webhook.id);

    if (index >= 0) {
        settings.webhooks[index] = webhook;
    } else {
        settings.webhooks.push(webhook);
    }

    saveSettings(settings);
}

/**
 * 删除 Webhook
 */
export function deleteWebhook(id: string): void {
    const settings = getSettings();
    settings.webhooks = settings.webhooks.filter((w) => w.id !== id);
    saveSettings(settings);
}

/**
 * 获取图册存储路径
 */
export function getAlbumStoragePath(): string {
    const settings = getSettings();
    return settings.albumStoragePath;
}

/**
 * 设置图册存储路径
 */
export function setAlbumStoragePath(path: string): void {
    const settings = getSettings();
    settings.albumStoragePath = path;
    saveSettings(settings);
}

/**
 * 获取图册导入路径
 */
export function getAlbumImportPath(): string {
    const settings = getSettings();
    return settings.albumImportPath || '/Users/sotary/albums-import';
}

/**
 * 设置图册导入路径
 */
export function setAlbumImportPath(path: string): void {
    const settings = getSettings();
    settings.albumImportPath = path;
    saveSettings(settings);
}
