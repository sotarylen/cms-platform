'use client';

import { useRouter } from 'next/navigation';
import { AlbumCover } from '@/components/album-cover';
import { ModelEditDialog } from '@/components/model-edit-dialog';
import type { Album, AlbumModel } from '@/lib/types';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, List, Users, ArrowDownWideNarrow, ArrowUpNarrowWide, AlignLeft, Clock, Hash } from "lucide-react"
import { Pagination } from '@/components/pagination';
import { DetailNavBar } from '@/components/navigation/detail-nav-bar';
import { AlbumGrid } from '@/components/album/album-grid';
import { StandardContainer } from '@/components/standard-container';
import { Image as ImageIcon } from "lucide-react";
import { useState } from 'react';
import Link from 'next/link';

type Props = {
    model: AlbumModel;
    albums: Album[];
    total: number;
    page: number;
    pageSize: number;
    prevId: number | null;
    nextId: number | null;
    sort?: 'newest' | 'oldest' | 'updated' | 'title' | 'id_asc' | 'id_desc';
    viewMode?: 'grid' | 'list';
    searchQuery?: string;
};

export function ModelDetailClient({
    model,
    albums,
    total,
    page,
    pageSize,
    prevId,
    nextId,
    sort = 'newest',
    viewMode = 'grid',
    searchQuery = ''
}: Props) {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState(searchQuery);

    // Build URL preserving all current params
    const buildUrl = (newParams: Record<string, string | number>) => {
        const params = new URLSearchParams();

        // Preserve current params
        params.set('sort', sort);
        params.set('view', viewMode);
        params.set('pageSize', pageSize.toString());
        if (searchQuery) params.set('query', searchQuery);

        // Override with new params
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === '' || value === undefined || value === null) {
                params.delete(key);
            } else {
                params.set(key, value.toString());
            }
        });

        return `/albums/models/${model.model_id}?${params.toString()}`;
    };

    const handlePageChange = (newPage: number) => {
        router.push(buildUrl({ page: newPage }) as any);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        router.push(buildUrl({ pageSize: newPageSize, page: 1 }) as any);
    };

    const handleSearch = () => {
        router.push(buildUrl({ query: searchValue, page: 1 }) as any);
    };

    const handleViewChange = (view: 'grid' | 'list') => {
        router.push(buildUrl({ view }) as any);
    };

    return (
        <div className="space-y-6">
            {/* Navigation */}
            <DetailNavBar
                backButton={{
                    href: null,
                    label: "返回列表",
                    icon: <ArrowLeft className="h-4 w-4" />
                }}
                navigation={{
                    prevHref: prevId ? `/albums/models/${prevId}` : null,
                    prevLabel: "上一个",
                    listHref: "/albums/models",
                    listLabel: "所有模特",
                    listIcon: <Users className="h-4 w-4" />,
                    nextHref: nextId ? `/albums/models/${nextId}` : null,
                    nextLabel: "下一个"
                }}
            />

            {/* Model Information */}
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Model Cover */}
                        {model.model_cover_url && (
                            <div className="flex-shrink-0">
                                <img
                                    src={model.model_cover_url}
                                    alt={model.model_name}
                                    className="w-32 h-32 object-cover rounded-lg"
                                />
                            </div>
                        )}

                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-bold">{model.model_name}</h1>
                                        <Badge variant="outline" className="font-mono">ID: {model.model_id}</Badge>
                                    </div>
                                    {model.model_alias && (
                                        <p className="text-sm text-muted-foreground">
                                            别名: {model.model_alias}
                                        </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        共 {model.album_count || 0} 个图册
                                    </p>
                                </div>
                                <ModelEditDialog model={model} />
                            </div>

                            {model.model_intro && (
                                <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed max-w-4xl">
                                    {model.model_intro}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Model Albums */}
            <StandardContainer
                title={`模特图册 (${total})`}
                actionLeft={
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        <Button
                            variant={sort === 'newest' ? 'default' : 'outline'}
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            title="最新"
                            asChild
                        >
                            <Link href={buildUrl({ sort: 'newest', page: 1 }) as any}>
                                <ArrowDownWideNarrow className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            variant={sort === 'updated' ? 'default' : 'outline'}
                            size="icon"
                            className="h-8 w-8 rounded-none border-l-0"
                            title="最近更新"
                            asChild
                        >
                            <Link href={buildUrl({ sort: 'updated', page: 1 }) as any}>
                                <Clock className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            variant={sort === 'title' ? 'default' : 'outline'}
                            size="icon"
                            className="h-8 w-8 rounded-none border-l-0"
                            title="按标题"
                            asChild
                        >
                            <Link href={buildUrl({ sort: 'title', page: 1 }) as any}>
                                <AlignLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            variant={sort === 'id_desc' || sort === 'id_asc' ? 'default' : 'outline'}
                            size="icon"
                            className="h-8 w-8 rounded-l-none border-l-0"
                            title="按ID"
                            asChild
                        >
                            <Link href={buildUrl({ sort: sort === 'id_desc' ? 'id_asc' : 'id_desc', page: 1 }) as any}>
                                <Hash className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                }
                search={{
                    value: searchValue,
                    onChange: setSearchValue,
                    onSearch: handleSearch,
                    placeholder: "搜索图册..."
                }}
                viewToggle={{
                    view: viewMode,
                    onViewChange: handleViewChange
                }}
            >
                <div className="space-y-4">
                    {albums.length === 0 ? (
                        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                            <p className="text-muted-foreground">该模特暂无图册</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <AlbumGrid
                            albums={albums}
                            emptyMessage="该模特暂无图册"
                        />
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
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-32">创建时间</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {albums.map((album) => (
                                        <tr key={album.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle text-sm text-muted-foreground">
                                                {album.id}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Link href={`/albums/${album.id}`}>
                                                    <div className="w-16 h-24 overflow-hidden rounded border bg-muted">
                                                        <AlbumCover
                                                            src={album.source_page_url}
                                                            alt={album.title || album.resource_title_raw}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Link
                                                    href={`/albums/${album.id}`}
                                                    className="font-medium text-foreground hover:text-primary transition-colors"
                                                >
                                                    {album.title || album.resource_title_raw}
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
                                                        className="text-foreground hover:text-primary transition-colors"
                                                    >
                                                        {album.studio_name}
                                                    </Link>
                                                ) : album.studio_name ? (
                                                    <span>{album.studio_name}</span>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="p-4 align-middle text-sm text-muted-foreground">
                                                {new Date(album.created_at).toLocaleDateString('zh-CN')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {total > 0 && (
                        <Pagination
                            total={total}
                            page={page}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            pageSizeOptions={[30, 60, 90]}
                        />
                    )}
                </div>
            </StandardContainer>
        </div>
    );
}
