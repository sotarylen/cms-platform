'use client';

import type { Album } from '@/lib/types';
import { ContentCard } from '@/components/data-display/content-card';
import { cn } from '@/lib/utils';

interface AlbumGridProps {
    albums: Album[];
    showOverlay?: boolean;
    emptyMessage?: string;
    className?: string;
}

export function AlbumGrid({
    albums,
    showOverlay = true,
    emptyMessage = '暂无图册',
    className,
}: AlbumGridProps) {
    // Filter out invalid albums
    const validAlbums = albums.filter(album => album.id && album.id !== 0);

    if (validAlbums.length === 0) {
        return (
            <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={cn(
            "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
            className
        )}>
            {validAlbums.map((album) => (
                <ContentCard
                    key={album.id}
                    title={album.title || album.resource_title_raw}
                    image={album.source_page_url || null}
                    href={`/albums/${album.id}`}
                    subtitle={
                        <div className="flex flex-wrap gap-1">
                            {album.studio_name && (
                                <span>{album.studio_name}</span>
                            )}
                            {album.studio_name && album.model_name && <span>•</span>}
                            {album.model_name && (
                                <span>{album.model_name}</span>
                            )}
                        </div>
                    }
                    overlay={
                        showOverlay ? (
                            <div className="flex gap-1.5 justify-end">
                                {album.image_count !== undefined && album.image_count > 0 && (
                                    <div className="px-2 py-0.5 rounded-md bg-blue-500/90 text-white text-xs font-semibold shadow-sm backdrop-blur-sm">
                                        {album.image_count}P
                                    </div>
                                )}
                                {album.video_count !== undefined && album.video_count > 0 && (
                                    <div className="px-2 py-0.5 rounded-md bg-purple-500/90 text-white text-xs font-semibold shadow-sm backdrop-blur-sm">
                                        {album.video_count}V
                                    </div>
                                )}
                            </div>
                        ) : undefined
                    }
                />
            ))}
        </div>
    );
}
