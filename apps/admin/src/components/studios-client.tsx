'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AlbumStudio } from '@/lib/types';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ExternalLink, LayoutGrid, List as ListIcon, Search } from "lucide-react"
import { StudioLogo } from "@/components/studio-logo"
import { StudiosPagination } from "@/components/studios-pagination"

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

    const handleSearchChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }
        params.set('page', '1'); // Reset to page 1 on search
        router.push(`/albums/studios?${params.toString()}`);
    };

    const handleViewChange = (newView: 'grid' | 'list') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', newView);
        router.push(`/albums/studios?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">摄影机构</h2>
                    <p className="text-muted-foreground">
                        浏览所有收录的摄影机构
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="搜索机构名称, 模特, 机构..."
                            defaultValue={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {/* View Toggle */}
                    <Button
                        variant={view === 'list' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => handleViewChange('list')}
                        title="列表视图"
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={view === 'grid' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => handleViewChange('grid')}
                        title="网格视图"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Studios Grid/List */}
            {paginatedStudios.length === 0 ? (
                <Card>
                    <CardContent className="flex h-[200px] items-center justify-center">
                        <p className="text-muted-foreground">未找到匹配的机构</p>
                    </CardContent>
                </Card>
            ) : view === 'grid' ? (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {paginatedStudios.map((studio) => (
                        <Card key={studio.studio_id} className="group hover:shadow-md transition-shadow overflow-hidden">
                            <Link href={`/albums/studios/${studio.studio_id}`}>
                                <div className="aspect-square overflow-hidden bg-muted relative flex items-center justify-center">
                                    <StudioLogo
                                        coverUrl={studio.studio_cover_url}
                                        studioName={studio.studio_name}
                                        size="lg"
                                    />
                                </div>
                            </Link>
                            <CardContent className="p-3 space-y-1">
                                <h3 className="font-medium text-sm truncate" title={studio.studio_name}>
                                    <Link href={`/albums/studios/${studio.studio_id}`} className="hover:underline">
                                        {studio.studio_name}
                                    </Link>
                                </h3>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="truncate flex-1">{studio.studio_intro ? studio.studio_intro.slice(0, 20) + '...' : '暂无简介'}</span>
                                    <div className="flex items-center gap-1 ml-2">
                                        <span className="font-mono">{studio.album_count || 0}</span>
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
                                </div>
                            </CardContent>
                        </Card>
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
                            {paginatedStudios.map((studio) => (
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
                                            className="font-medium hover:underline"
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
            <div className="mt-4">
                <StudiosPagination
                    total={totalFiltered}
                    page={page}
                    pageSize={pageSize}
                    view={view}
                />
            </div>
        </div>
    );
}
