'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { updateAllAlbumCountsAction } from '@/app/actions/album-counts';
import { toast } from 'sonner';

export function AlbumCountsManager() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [result, setResult] = useState<{ success: boolean; updated?: number; error?: string } | null>(null);

    const handleUpdateAll = async () => {
        setIsUpdating(true);
        setResult(null);

        try {
            const res = await updateAllAlbumCountsAction();
            setResult(res);

            if (res.success) {
                toast.success(`成功更新 ${res.updated} 个图册的计数`);
            } else {
                toast.error(res.error || '更新失败');
            }
        } catch (error) {
            toast.error('发生错误');
            setResult({ success: false, error: '发生未知错误' });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>图册计数管理</CardTitle>
                <CardDescription>
                    批量更新所有图册的图片和视频数量。这是一个一次性操作，用于初始化数据库中的计数缓存。
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                    <Button
                        onClick={handleUpdateAll}
                        disabled={isUpdating}
                        size="lg"
                    >
                        {isUpdating ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                更新中...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                更新所有图册计数
                            </>
                        )}
                    </Button>
                </div>

                {result && (
                    <div className={`flex items-start gap-3 p-4 rounded-lg ${result.success
                            ? 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100'
                            : 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100'
                        }`}>
                        {result.success ? (
                            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                            <p className="font-medium">
                                {result.success ? '更新成功' : '更新失败'}
                            </p>
                            <p className="text-sm mt-1">
                                {result.success
                                    ? `已更新 ${result.updated} 个图册的图片和视频计数`
                                    : result.error
                                }
                            </p>
                        </div>
                    </div>
                )}

                <div className="text-sm text-muted-foreground space-y-2">
                    <p><strong>注意事项：</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>此操作会扫描所有图册的文件夹，可能需要较长时间</li>
                        <li>建议在系统负载较低时执行</li>
                        <li>执行过程中请勿关闭页面</li>
                        <li>完成后，所有页面的图片/视频徽章将正常显示</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
