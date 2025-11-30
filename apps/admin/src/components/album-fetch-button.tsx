'use client';

import React, { useState } from 'react';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlbumFetchButtonProps {
    albumId: number;
    albumTitle: string;
    className?: string;
}

const AlbumFetchButton: React.FC<AlbumFetchButtonProps> = ({
    albumId,
    albumTitle,
    className = '',
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleClick = async () => {
        console.log(`[AlbumFetchButton] 开始抓取图册 ${albumId}`, {
            timestamp: new Date().toISOString(),
            albumId,
            albumTitle,
        });

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/albums/${albumId}/fetch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    albumId,
                    albumTitle,
                }),
            });

            const result = await response.json();

            console.log(`[AlbumFetchButton] 收到响应`, {
                status: response.status,
                response: result,
            });

            if (!response.ok) {
                throw new Error(result.message || '抓取失败');
            }

            setSuccess('已成功触发图册抓取任务');

            // 等待5秒后刷新页面
            await new Promise((resolve) => setTimeout(resolve, 5000));
            window.location.reload();
        } catch (err: any) {
            const errorMessage = err.message || '发生未知错误';
            setError(errorMessage);
            console.error('抓取图册失败:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleClick}
                disabled={isLoading}
                className={className}
                size="sm"
            >
                <Download className="mr-2 h-4 w-4" />
                {isLoading ? '抓取中...' : '抓取图册'}
            </Button>
            {error && (
                <div className="text-destructive text-sm mt-2">
                    错误: {error}
                </div>
            )}
            {success && !isLoading && (
                <div className="text-green-600 text-sm mt-2">
                    {success}，5秒后将刷新页面...
                </div>
            )}
        </>
    );
};

export default AlbumFetchButton;
