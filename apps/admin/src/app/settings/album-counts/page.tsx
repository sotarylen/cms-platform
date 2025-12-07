import { PageHeader } from '@/components/layout/page-header';
import { AlbumCountsManager } from '@/components/album-counts-manager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AlbumCountsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <PageHeader
                    title="图册计数管理"
                    subtitle="批量更新图册的图片和视频数量缓存"
                />
            </div>

            <div className="max-w-4xl">
                <AlbumCountsManager />
            </div>
        </div>
    );
}
