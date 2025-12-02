'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlbumCover } from '@/components/album-cover';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Users, Building2, ArrowDownWideNarrow, ArrowUpNarrowWide, Clock } from "lucide-react"
import type { Album, AlbumStats } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { ContentCard } from '@/components/data-display/content-card';
import { Pagination } from '@/components/pagination';
import { StandardContainer } from '@/components/standard-container';

interface AlbumsClientProps {
    stats: AlbumStats;
    albumsData: {
        items: Album[];
        total: number;
        page: number;
        pageSize: number;
    };
    searchQuery: string;
    sort: 'newest' | 'oldest' | 'updated';
    viewMode: 'grid' | 'list';
}

export function AlbumsClient({ stats, albumsData, searchQuery, sort, viewMode }: AlbumsClientProps) {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState(searchQuery);
    const totalPages = Math.ceil(albumsData.total / albumsData.pageSize);

    // Build URL preserving all current params
    const buildUrl = (newParams: Record<string, string | number>) => {
        const params = new URLSearchParams();

        // Preserve current params
        params.set('sort', sort);
        params.set('view', viewMode);
        params.set('pageSize', albumsData.pageSize.toString());
        if (searchQuery) params.set('query', searchQuery);

        // Override with new params
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === '' || value === undefined || value === null) {
                params.delete(key);
            } else {
                params.set(key, value.toString());
            }
        });

        return `/albums?${params.toString()}`;
    };

    const handlePageSizeChange = (newSize: string) => {
        router.push(buildUrl({ pageSize: newSize, page: 1 }));
    };

    const handleSearch = () => {
        router.push(buildUrl({ query: searchValue, page: 1 }));
    };

    const handleViewChange = (view: 'grid' | 'list') => {
        router.push(buildUrl({ view }));
    };

    return (
        <div className="space-y-6">
            {/* Stats Section */}
            <PageHeader
                title="图册管理"
                description="浏览和管理所有图册、模特和机构。"
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatCard
                    title="总图集数"
                    value={stats.albums}
                    icon={ImageIcon}
                    gradient="from-blue-500/10 to-blue-500/5"
                />
                <StatCard
                    title="总模特数"
                    value={stats.models}
                    icon={Users}
                    gradient="from-green-500/10 to-green-500/5"
                />
                <StatCard
                    title="总机构数"
                    value={stats.studios}
                    icon={Building2}
                    gradient="from-purple-500/10 to-purple-500/5"
                />
                <StatCard
                    title="今日新增"
                    value={0} // Placeholder or remove if not available in stats
                    icon={ArrowUpNarrowWide}
                    gradient="from-orange-500/10 to-orange-500/5"
                />
                <StatCard
                    title="最近更新"
                    value="-" // Placeholder
                    icon={Clock}
                    gradient="from-pink-500/10 to-pink-500/5"
                />
            </div>

            {/* Albums List Section */}
            <StandardContainer
                title="图册列表"
                actionLeft={
                    <div className="flex items-center gap-1">
                        <Button
                            variant={sort === 'newest' ? 'default' : 'outline'}
                            size="icon"
                            className="h-8 w-8"
                            title="最新"
                            asChild
                        >
                            <Link href={buildUrl({ sort: 'newest', page: 1 }) as any}>
                                <ArrowDownWideNarrow className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            variant={sort === 'oldest' ? 'default' : 'outline'}
                            size="icon"
                            className="h-8 w-8"
                            title="最旧"
                            asChild
                        >
                            <Link href={buildUrl({ sort: 'oldest', page: 1 }) as any}>
                                <ArrowUpNarrowWide className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            variant={sort === 'updated' ? 'default' : 'outline'}
                            size="icon"
                            className="h-8 w-8"
                            title="最新修改"
                            asChild
                        >
                            <Link href={buildUrl({ sort: 'updated', page: 1 })}>
                                <Clock className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                }
                search={{
                    value: searchValue,
                    onChange: setSearchValue,
                    onSearch: handleSearch,
                    placeholder: "搜索图册名称、模特、机构..."
                }}
                viewToggle={{
                    view: viewMode,
                    onViewChange: handleViewChange
                }}
            >
                <div className="space-y-4">
                    {/* Albums Grid/List */}
                    {albumsData.items.length === 0 ? (
                        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                            <p className="text-muted-foreground">暂无图册</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {albumsData.items.filter(album => album.id && album.id !== 0).map((album) => (
                                <ContentCard
                                    key={album.id}
                                    title={album.resource_title_raw}
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
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-20">ID</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-24">封面</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">标题</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-24">图片数</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">机构</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">模特</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-32">创建时间</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {albumsData.items.filter(album => album.id && album.id !== 0).map((album) => (
                                        <tr key={album.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle text-sm text-muted-foreground">
                                                {album.id}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Link href={`/albums/${album.id}`}>
                                                    <div className="w-16 h-24 overflow-hidden rounded border bg-muted">
                                                        <AlbumCover
                                                            src={album.source_page_url}
                                                            alt={album.resource_title_raw}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Link
                                                    href={`/albums/${album.id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {album.resource_title_raw}
                                                </Link>
                                            </td>
                                            <td className="p-4 align-middle text-sm text-center">
                                                <span className="inline-flex items-center gap-1">
                                                    <ImageIcon className="h-3 w-3" />
                                                    {album.image_count ?? 0}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-sm">
                                                {album.studio_id ? (
                                                    <Link
                                                        href={`/albums/studios/${album.studio_id}`}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {album.studio_name}
                                                    </Link>
                                                ) : '—'}
                                            </td>
                                            <td className="p-4 align-middle text-sm">
                                                {album.model_name ?? '—'}
                                            </td>
                                            <td className="p-4 align-middle text-sm text-muted-foreground">
                                                {album.created_at.toLocaleDateString('zh-CN')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 0 && (
                        <div className="pt-0">
                            <Pagination
                                total={albumsData.total}
                                page={albumsData.page}
                                pageSize={albumsData.pageSize}
                                onPageChange={(newPage) => {
                                    router.push(buildUrl({ page: newPage }));
                                }}
                                onPageSizeChange={handlePageSizeChange}
                                pageSizeOptions={[12, 24, 36, 48]}
                            />
                        </div>
                    )}
                </div>
            </StandardContainer>
        </div>
    );
}

