'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FolderInput, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { importAlbumsAction, type ImportSummary, type ImportResult } from '@/app/actions/import-albums';
import { useRouter } from 'next/navigation';

export function ImportAlbumsButton() {
    const [isImporting, setIsImporting] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [importResult, setImportResult] = useState<ImportSummary | null>(null);
    const router = useRouter();

    const handleImport = async () => {
        setIsImporting(true);
        setShowDialog(true);
        setImportResult(null);

        try {
            const result = await importAlbumsAction();
            setImportResult(result);

            if (result.imported > 0) {
                toast.success(`成功导入 ${result.imported} 个图册`);
                router.refresh();
            } else if (result.total === 0) {
                toast.info('导入目录中没有待处理的文件夹');
            } else {
                toast.warning('没有成功导入任何图册');
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error('导入过程中发生错误');
            setImportResult({
                success: false,
                total: 0,
                imported: 0,
                skipped: 0,
                failed: 0,
                details: []
            });
        } finally {
            setIsImporting(false);
        }
    };

    const getStatusIcon = (status: ImportResult['status']) => {
        switch (status) {
            case 'success':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'skipped':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
        }
    };

    return (
        <>
            <Button
                onClick={handleImport}
                size="icon"
                className="h-8 w-8"
                disabled={isImporting}
                title="从导入目录批量导入图册"
            >
                {isImporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <FolderInput className="h-4 w-4" />
                )}
            </Button>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>批量导入图册</DialogTitle>
                        <DialogDescription>
                            {isImporting ? '正在处理导入...' : '导入完成'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {isImporting && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>正在导入...</span>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                                <Progress value={undefined} className="h-2" />
                            </div>
                        )}

                        {importResult && (
                            <>
                                {/* 统计摘要 */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="rounded-lg border p-3 text-center">
                                        <div className="text-2xl font-bold">{importResult.total}</div>
                                        <div className="text-xs text-muted-foreground">总计</div>
                                    </div>
                                    <div className="rounded-lg border p-3 text-center bg-green-50 dark:bg-green-950">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {importResult.imported}
                                        </div>
                                        <div className="text-xs text-muted-foreground">成功</div>
                                    </div>
                                    <div className="rounded-lg border p-3 text-center bg-yellow-50 dark:bg-yellow-950">
                                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                            {importResult.skipped}
                                        </div>
                                        <div className="text-xs text-muted-foreground">跳过</div>
                                    </div>
                                    <div className="rounded-lg border p-3 text-center bg-red-50 dark:bg-red-950">
                                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                            {importResult.failed}
                                        </div>
                                        <div className="text-xs text-muted-foreground">失败</div>
                                    </div>
                                </div>

                                {/* 详细列表 */}
                                {importResult.details.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm">详细信息</h4>
                                        <div className="space-y-1 max-h-96 overflow-y-auto">
                                            {importResult.details.map((detail, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start gap-2 rounded-md border p-2 text-sm"
                                                >
                                                    <div className="mt-0.5">{getStatusIcon(detail.status)}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate">{detail.folder}</div>
                                                        {detail.status === 'success' && detail.albumId && (
                                                            <div className="text-xs text-muted-foreground">
                                                                → 图册 #{detail.albumId}
                                                                {detail.studio && ` · ${detail.studio}`}
                                                                {detail.model && ` · ${detail.model}`}
                                                            </div>
                                                        )}
                                                        {detail.reason && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {detail.reason}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {!isImporting && importResult && (
                        <div className="flex justify-end">
                            <Button onClick={() => setShowDialog(false)}>关闭</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
