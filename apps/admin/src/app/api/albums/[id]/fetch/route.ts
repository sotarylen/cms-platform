import { NextRequest, NextResponse } from 'next/server';
import { getWebhookById } from '@/lib/config';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const albumId = Number(resolvedParams.id);
        const body = await request.json();

        console.log(`[Album Fetch API] 收到抓取请求`, {
            albumId,
            body,
            timestamp: new Date().toISOString(),
        });

        // 获取webhook配置（默认使用第一个，或通过body指定）
        const webhookId = body.webhookId || 'album-fetch';
        const webhook = getWebhookById(webhookId);

        if (!webhook) {
            return NextResponse.json(
                { success: false, message: '找不到对应的 Webhook 配置' },
                { status: 404 }
            );
        }

        // 准备发送给n8n的数据
        const payload = {
            albumId,
            albumTitle: body.albumTitle,
            timestamp: new Date().toISOString(),
            action: 'fetch_album',
        };

        // 准备请求头
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // 如果有API Key，添加到请求头
        if (webhook.apiKey) {
            headers['Authorization'] = `Bearer ${webhook.apiKey}`;
        }

        console.log(`[Album Fetch API] 调用 webhook`, {
            url: webhook.url,
            payload,
            hasApiKey: !!webhook.apiKey,
        });

        // 调用n8n webhook
        const response = await fetch(webhook.url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        console.log(`[Album Fetch API] Webhook 响应`, {
            status: response.status,
            result,
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: 'Webhook 调用失败', details: result },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '已成功触发抓取任务',
            webhookUrl: webhook.url,
            response: result,
        });
    } catch (error: any) {
        console.error('[Album Fetch API] 错误:', error);
        return NextResponse.json(
            { success: false, message: error.message || '服务器错误' },
            { status: 500 }
        );
    }
}
