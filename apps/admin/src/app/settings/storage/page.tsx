import { getSettingsAction } from '@/app/actions/settings';
import { StoragePathSettings } from '@/components/storage-path-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function StorageSettingsPage() {
    const result = await getSettingsAction();
    const storagePath = result.success && result.data ? result.data.albumStoragePath : '';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">存储配置</h1>
                    <p className="text-muted-foreground mt-2">管理文件存储路径和选项</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>本地存储路径</CardTitle>
                    <CardDescription>
                        配置图册和其他媒体资源的本地存储位置。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <StoragePathSettings initialPath={storagePath} />
                </CardContent>
            </Card>
        </div>
    );
}
