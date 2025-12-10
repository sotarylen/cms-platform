'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StudioEditModal } from '@/components/studio-edit-modal';
import type { Album, AlbumStudio } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlbumCover } from '@/components/album-cover';
import { ArrowLeft, Building2, List, Edit, ExternalLink, ArrowDownWideNarrow, ArrowUpNarrowWide, AlignLeft, Clock, Hash } from 'lucide-react';
import { Pagination } from '@/components/pagination';
import { DetailNavBar } from '@/components/navigation/detail-nav-bar';
import { AlbumGrid } from '@/components/album/album-grid';
import { StandardContainer } from '@/components/standard-container';
import { StudioLogo } from '@/components/studio-logo';
import { Image as ImageIcon } from "lucide-react";

type Props = {
    studio: AlbumStudio;
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

export function StudioDetailClient({
    studio: initialStudio,
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
    const [studio, setStudio] = useState(initialStudio);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchValue, setSearchValue] = useState(searchQuery);
    const router = useRouter();

    // Build URL preserving all current params
    const buildUrl = (newParams: Record<string, string | number>) => {
        const params = new URLSearchParams();

        // Preserve current params
        params.set('sort', sort);
        params.set('view', viewMode);
        params.set('pageSize', pageSize.toString());

        // Override with new params
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === '' || value === undefined || value === null) {
                params.delete(key);
            } else {
                params.set(key, value.toString());
            }
        });

        return `/albums/studios/${studio.studio_id}?${params.toString()}`;
    };

    const handleSearch = () => {
        router.push(buildUrl({ query: searchValue, page: 1 }) as any);
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        window.location.reload();
    };

    const handlePageChange = (newPage: number) => {
        router.push(buildUrl({ page: newPage }) as any);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        router.push(buildUrl({ pageSize: newPageSize, page: 1 }) as any);
    };

    const handleViewChange = (view: 'grid' | 'list') => {
        router.push(buildUrl({ view }) as any);
    };

    return (
        <div className="space-y-6">
            {/* Navigation */}
            {/* Navigation */}
            <DetailNavBar
                backButton={{
                    href: "/albums/studios",
                    label: "返回列表",
                    icon: <ArrowLeft className="h-4 w-4" />
                }}
                navigation={{
                    prevHref: prevId ? `/albums/studios/${prevId}` : null,
                    prevLabel: "上一个",
                    listHref: "/albums/studios",
                    listLabel: "所有机构",
                    listIcon: <List className="h-4 w-4" />,
                    nextHref: nextId ? `/albums/studios/${nextId}` : null,
                    nextLabel: "下一个"
                }}
            />

            {/* Studio Information */}
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0">
                            <StudioLogo
                                coverUrl={studio.studio_cover_url || null}
                                studioName={studio.studio_name}
                                size="lg"
                            />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-bold">{studio.studio_name}</h1>
                                        <Badge variant="outline" className="font-mono">ID: {studio.studio_id}</Badge>
                                    </div>
                                    {studio.studio_url && (
                                        <a
                                            href={studio.studio_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <ExternalLink className="mr-1 h-3 w-3" />
                                            访问官网
                                        </a>
                                    )}
                                </div>
                                <Button onClick={() => setShowEditModal(true)} variant="outline" size="sm">
                                    <Edit className="mr-2 h-4 w-4" />
                                    编辑工作室
                                </Button>
                            </div>

                            {studio.studio_intro ? (
                                <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed max-w-4xl">
                                    {studio.studio_intro}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">暂无简介</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Studio Albums */}
            <StandardContainer
                title={`工作室图册 (${total})`}
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
                            <p className="text-muted-foreground">该工作室暂无图册</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <AlbumGrid
                            albums={albums}
                            emptyMessage="该工作室暂无图册"
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
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">模特</th>
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
                                                {album.model_id ? (
                                                    <Link
                                                        href={`/albums/models/${album.model_id}`}
                                                        className="text-foreground hover:text-primary transition-colors"
                                                    >
                                                        {album.model_name}
                                                    </Link>
                                                ) : album.model_name ? (
                                                    <span>{album.model_name}</span>
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

            {/* Edit Modal */}
            <StudioEditModal
                studio={studio}
                open={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={handleEditSuccess}
            />
        </div>
    );
}
