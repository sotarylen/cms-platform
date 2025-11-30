'use client';

import { useState } from 'react';
import { updateAlbumStoragePathAction } from '@/app/actions/settings';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Props = {
    initialPath: string;
};

export function StoragePathSettings({ initialPath }: Props) {
    const [path, setPath] = useState(initialPath);
    const [backupPath, setBackupPath] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);

        const result = await updateAlbumStoragePathAction(path);

        if (result.success) {
            toast.success('保存成功');
        } else {
            toast.error(result.error || '保存失败');
        }

        setLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* Configuration Item 1 */}
            <div className="grid grid-cols-[200px_1fr_300px] gap-4 items-start">
                <Label htmlFor="storage-path" className="pt-2">图册存储路径</Label>
                <Input
                    id="storage-path"
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="/path/to/albums"
                    className="font-mono"
                />
                <p className="text-sm text-muted-foreground pt-2">
                    图片按图册ID创建子文件夹存储
                </p>
            </div>

            {/* Configuration Item 2 (Example) */}
            <div className="grid grid-cols-[200px_1fr_300px] gap-4 items-start">
                <Label htmlFor="backup-path" className="pt-2">备份存储路径</Label>
                <Input
                    id="backup-path"
                    type="text"
                    value={backupPath}
                    onChange={(e) => setBackupPath(e.target.value)}
                    placeholder="/path/to/backup"
                    className="font-mono"
                />
                <p className="text-sm text-muted-foreground pt-2">
                    可选，留空则不启用备份功能
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
