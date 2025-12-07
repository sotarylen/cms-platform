'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AlbumStudio } from '@/lib/types';
import { ExternalLink } from "lucide-react"
import { StudioLogo } from "@/components/studio-logo"
import { Pagination } from "@/components/pagination"
import { ContentCard } from "@/components/data-display/content-card"
import { StandardContainer } from "@/components/standard-container"
import { PageHeader } from "@/components/layout/page-header"
import { StudioCreateDialog } from "@/components/studio-create-dialog"

interface StudiosClientProps {
    studios: AlbumStudio[];
    page: number;
    pageSize: number;
    view: 'grid' | 'list';
    search: string;
}

export function StudiosClient({ studios, page, pageSize, view, search }: StudiosClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState(search);

    const filteredStudios = useMemo(() => {
        if (!search.trim()) return studios;
        const query = search.toLowerCase();
        return studios.filter(studio =>
            studio.studio_name.toLowerCase().includes(query) ||
            studio.studio_intro?.toLowerCase().includes(query)
        );
    }, [studios, search]);

    // Pagination
    const totalFiltered = filteredStudios.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedStudios = filteredStudios.slice(startIndex, endIndex);

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchValue) {
            params.set('search', searchValue);
        } else {
            params.delete('search');
        }
        params.set('page', '1');
        router.push(`/albums/studios?${params.toString()}`);
    };

    const handleViewChange = (newView: 'grid' | 'list') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', newView);
        router.push(`/albums/studios?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="摄影机构"
                subtitle="浏览所有收录的摄影机构"
            />

            <StandardContainer
                title="机构列表"
                search={{
                    value: searchValue,
                    onChange: setSearchValue,
                    onSearch: handleSearch,
                    placeholder: "搜索机构名称..."
                }}
                viewToggle={{
                    view: view,
                    onViewChange: handleViewChange
                }}
                actionsRight={<StudioCreateDialog />}
            >
                <div className="space-y-4">
                    {/* Studios Grid/List */}
                    {paginatedStudios.length === 0 ? (
                        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                            <p className="text-muted-foreground">未找到匹配的机构</p>
                        </div>
                    ) : view === 'grid' ? (
                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {paginatedStudios.filter(studio => studio.studio_id && studio.studio_id !== 0).map((studio) => (
                                <ContentCard
                                    key={studio.studio_id}
                                    title={studio.studio_name}
                                    image={studio.studio_cover_url || null}
                                    href={`/albums/studios/${studio.studio_id}`}
                                    aspectRatio="square"
                                    subtitle={
                                        <span className="truncate block">
                                            {studio.studio_intro ? studio.studio_intro : '暂无简介'}
                                        </span>
                                    }
                                    footer={
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <span>#{studio.studio_id} </span>
                                                <span>•</span>
                                                <span className="font-mono">{studio.album_count || 0}</span>
                                            </div>
                                            {studio.studio_url && (
                                                <a
                                                    href={studio.studio_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:text-foreground"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[80px]">ID</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[60px]">Logo</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">名称</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">简介</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">图册数量</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">链接</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedStudios.filter(studio => studio.studio_id && studio.studio_id !== 0).map((studio) => (
                                        <tr key={studio.studio_id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-mono text-xs text-muted-foreground">
                                                #{studio.studio_id}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <StudioLogo
                                                    coverUrl={studio.studio_cover_url}
                                                    studioName={studio.studio_name}
                                                    size="sm"
                                                />
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Link
                                                    href={`/albums/studios/${studio.studio_id}`}
                                                    className="font-medium text-foreground hover:text-primary transition-colors"
                                                >
                                                    {studio.studio_name}
                                                </Link>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                <p className="line-clamp-2 max-w-[400px]">
                                                    {studio.studio_intro || '暂无简介'}
                                                </p>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className="font-mono text-muted-foreground">
                                                    {studio.album_count || 0}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle">
                                                {studio.studio_url && (
                                                    <a
                                                        href={studio.studio_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center text-xs text-muted-foreground hover:text-foreground"
                                                    >
                                                        官网 <ExternalLink className="ml-1 h-3 w-3" />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <Pagination
                        total={totalFiltered}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={(newPage) => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('page', newPage.toString());
                            router.push(`/albums/studios?${params.toString()}`);
                        }}
                        onPageSizeChange={(newPageSize) => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('pageSize', newPageSize.toString());
                            params.set('page', '1');
                            router.push(`/albums/studios?${params.toString()}`);
                        }}
                    />
                </div>
            </StandardContainer>
        </div>
    );
}
