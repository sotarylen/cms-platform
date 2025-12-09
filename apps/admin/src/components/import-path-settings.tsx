'use client';

import { useState } from 'react';
import { updateAlbumImportPathAction } from '@/app/actions/settings';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Props = {
    initialPath: string;
};

export function ImportPathSettings({ initialPath }: Props) {
    const [path, setPath] = useState(initialPath);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);

        const result = await updateAlbumImportPathAction(path);

        if (result.success) {
            toast.success('保存成功');
        } else {
            toast.error(result.error || '保存失败');
        }

        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-[200px_1fr_300px] gap-4 items-start">
                <Label htmlFor="import-path" className="pt-2">图册导入路径</Label>
                <Input
                    id="import-path"
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="/path/to/albums-import"
                    className="font-mono"
                />
                <p className="text-sm text-muted-foreground pt-2">
                    文件夹格式：[工作室][模特]图册名称
                    <br />
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                        导入时将使用完整的文件夹名称作为图册标题
                    </span>
                </p>
            </div>

            {/* Save Button */}
            <div className="grid grid-cols-[200px_1fr_300px] gap-4">
                <div></div>
                <Button onClick={handleSave} disabled={loading} className="w-fit">
                    {loading ? '保存中...' : '保存'}
                </Button>
                <div></div>
            </div>
        </div>
    );
}
