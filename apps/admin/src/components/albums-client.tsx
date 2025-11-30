'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlbumCover } from '@/components/album-cover';
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Image as ImageIcon, Users, Building2, Search, ChevronLeft, ChevronRight, ArrowDownWideNarrow, ArrowUpNarrowWide, Clock } from "lucide-react"
import type { Album, AlbumStats } from '@/lib/types';

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
    const [jumpPage, setJumpPage] = useState(albumsData.page.toString());

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
            params.set(key, value.toString());
        });

        return `/albums?${params.toString()}`;
    };

    const handlePageSizeChange = (newSize: string) => {
        window.location.href = buildUrl({ pageSize: newSize, page: 1 });
    };

    const handleJumpPage = (e: React.FormEvent) => {
        e.preventDefault();
        const p = parseInt(jumpPage);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
            window.location.href = buildUrl({ page: p });
        } else {
            setJumpPage(albumsData.page.toString());
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Section */}
            <Card>
                <CardHeader>
                    <div className="text-lg font-semibold">数据一览</div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between space-x-4">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            总图集数
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {stats.albums.toLocaleString()}
                                        </p>
                                    </div>
                                    <ImageIcon className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between space-x-4">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            总模特数
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {stats.models.toLocaleString()}
                                        </p>
                                    </div>
                                    <Users className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between space-x-4">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            总机构数
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {stats.studios.toLocaleString()}
                                        </p>
                                    </div>
                                    <Building2 className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            {/* Albums List Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
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
                                <Link href={buildUrl({ sort: 'updated', page: 1 }) as any}>
                                    <Clock className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="flex gap-2 flex-1 max-w-md items-center">
                            <form method="get" className="flex gap-2 flex-1">
                                <input type="hidden" name="sort" value={sort} />
                                <input type="hidden" name="view" value={viewMode} />
                                <input type="hidden" name="pageSize" value={albumsData.pageSize} />
                                <div className="relative flex-1">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        name="query"
                                        placeholder="搜索图册名称、模特、机构..."
                                        defaultValue={searchQuery}
                                        className="pl-8"
                                    />
                                </div>
                                <Button type="submit">搜索</Button>
                            </form>
                            <div className="flex gap-1 border rounded-md p-1">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="icon"
                                    className="h-7 w-7"
                                    title="网格视图"
                                    asChild
                                >
                                    <Link href={buildUrl({ view: 'grid' }) as any}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="7" height="7" x="3" y="3" rx="1" />
                                            <rect width="7" height="7" x="14" y="3" rx="1" />
                                            <rect width="7" height="7" x="14" y="14" rx="1" />
                                            <rect width="7" height="7" x="3" y="14" rx="1" />
                                        </svg>
                                    </Link>
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="icon"
                                    className="h-7 w-7"
                                    title="列表视图"
                                    asChild
                                >
                                    <Link href={buildUrl({ view: 'list' }) as any}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="8" x2="21" y1="6" y2="6" />
                                            <line x1="8" x2="21" y1="12" y2="12" />
                                            <line x1="8" x2="21" y1="18" y2="18" />
                                            <line x1="3" x2="3.01" y1="6" y2="6" />
                                            <line x1="3" x2="3.01" y1="12" y2="12" />
                                            <line x1="3" x2="3.01" y1="18" y2="18" />
                                        </svg>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Albums Grid/List */}
                    {albumsData.items.length === 0 ? (
                        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                            <p className="text-muted-foreground">暂无图册</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {albumsData.items.map((album) => (
                                <Link
                                    key={album.id}
                                    href={`/albums/${album.id}`}
                                    className="group block space-y-2"
                                >
                                    <div className="overflow-hidden rounded-md border bg-muted aspect-[2/3]">
                                        <AlbumCover
                                            src={album.source_page_url}
                                            alt={album.resource_title_raw}
                                            className="h-full w-full object-cover transition-all hover:scale-105"
                                        />
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <h3 className="font-medium leading-none truncate" title={album.resource_title_raw}>
                                            {album.resource_title_raw}
                                        </h3>
                                        <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                                            {album.studio_name && (
                                                <span>{album.studio_name}</span>
                                            )}
                                            {album.studio_name && album.model_name && <span>•</span>}
                                            {album.model_name && (
                                                <span>{album.model_name}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
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
                                    {albumsData.items.map((album) => (
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
                        <div className="flex items-center justify-between px-2 pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                共 {albumsData.total} 条
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">每页</span>
                                    <Select
                                        value={albumsData.pageSize.toString()}
                                        onValueChange={handlePageSizeChange}
                                    >
                                        <SelectTrigger className="h-8 w-[70px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[12, 24, 36, 48].map((size) => (
                                                <SelectItem key={size} value={size.toString()}>
                                                    {size}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <span className="text-sm text-muted-foreground">条</span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={albumsData.page <= 1}
                                        asChild={albumsData.page > 1}
                                    >
                                        {albumsData.page > 1 ? (
                                            <Link href={buildUrl({ page: albumsData.page - 1 }) as any}>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Link>
                                        ) : (
                                            <span>
                                                <ChevronLeft className="h-4 w-4" />
                                            </span>
                                        )}
                                    </Button>
                                    <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                                        {albumsData.page} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={albumsData.page >= totalPages}
                                        asChild={albumsData.page < totalPages}
                                    >
                                        {albumsData.page < totalPages ? (
                                            <Link href={buildUrl({ page: albumsData.page + 1 }) as any}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        ) : (
                                            <span>
                                                <ChevronRight className="h-4 w-4" />
                                            </span>
                                        )}
                                    </Button>
                                </div>

                                <form onSubmit={handleJumpPage} className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">跳至</span>
                                    <Input
                                        className="h-8 w-[50px] text-center"
                                        value={jumpPage}
                                        onChange={(e) => setJumpPage(e.target.value)}
                                    />
                                    <span className="text-sm text-muted-foreground">页</span>
                                </form>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

