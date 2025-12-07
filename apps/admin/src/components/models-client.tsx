'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AlbumModel } from '@/lib/types';
import { Users } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { ContentCard } from "@/components/data-display/content-card"
import { StandardContainer } from "@/components/standard-container"
import { PageHeader } from "@/components/layout/page-header"
import { ModelCreateDialog } from "@/components/model-create-dialog"

interface ModelsClientProps {
    models: AlbumModel[];
    page: number;
    pageSize: number;
    view: 'grid' | 'list';
    search: string;
}

export function ModelsClient({ models, page, pageSize, view, search }: ModelsClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState(search);

    const filteredModels = useMemo(() => {
        if (!search.trim()) return models;
        const query = search.toLowerCase();
        return models.filter(model =>
            model.model_name.toLowerCase().includes(query)
        );
    }, [models, search]);

    // Pagination
    const totalFiltered = filteredModels.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedModels = filteredModels.slice(startIndex, endIndex);

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchValue) {
            params.set('search', searchValue);
        } else {
            params.delete('search');
        }
        params.set('page', '1');
        router.push(`/albums/models?${params.toString()}`);
    };

    const handleViewChange = (newView: 'grid' | 'list') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', newView);
        router.push(`/albums/models?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="模特"
                subtitle="浏览所有收录的模特"
            />

            <StandardContainer
                title="模特列表"
                search={{
                    value: searchValue,
                    onChange: setSearchValue,
                    onSearch: handleSearch,
                    placeholder: "搜索模特名称..."
                }}
                viewToggle={{
                    view: view,
                    onViewChange: handleViewChange
                }}
                actionsRight={<ModelCreateDialog />}
            >
                <div className="space-y-4">
                    {/* Models Grid/List */}
                    {paginatedModels.length === 0 ? (
                        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                            <p className="text-muted-foreground">未找到匹配的模特</p>
                        </div>
                    ) : view === 'grid' ? (
                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {paginatedModels.filter(model => model.model_id && model.model_id !== 0).map((model) => (
                                <ContentCard
                                    key={model.model_id}
                                    title={model.model_name}
                                    image={model.model_cover_url || null}
                                    href={`/albums/models/${model.model_id}`}
                                    aspectRatio="square"
                                    subtitle={
                                        <span className="truncate block text-xs">
                                            {model.model_intro ? model.model_intro : `${model.album_count || 0} 个图册`}
                                        </span>
                                    }
                                    footer={
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <span>#{model.model_id}</span>
                                                <span>•</span>
                                                <span className="font-mono">{model.album_count || 0}</span>
                                            </div>
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
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[60px]">封面</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">名称</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">简介</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">图册数量</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedModels.filter(model => model.model_id && model.model_id !== 0).map((model) => (
                                        <tr key={model.model_id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-mono text-xs text-muted-foreground">
                                                #{model.model_id}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {model.model_cover_url ? (
                                                    <img
                                                        src={model.model_cover_url}
                                                        alt={model.model_name}
                                                        className="w-10 h-10 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                                        <Users className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Link
                                                    href={`/albums/models/${model.model_id}`}
                                                    className="font-medium text-foreground hover:text-primary transition-colors"
                                                >
                                                    {model.model_name}
                                                </Link>
                                                {model.model_alias && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {model.model_alias}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                                                    {model.model_intro || '暂无简介'}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle font-mono text-xs">
                                                {model.album_count || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalFiltered > pageSize && (
                        <Pagination
                            total={totalFiltered}
                            page={page}
                            pageSize={pageSize}
                            onPageChange={(newPage) => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set('page', newPage.toString());
                                router.push(`/albums/models?${params.toString()}`);
                            }}
                            onPageSizeChange={(newSize) => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set('pageSize', newSize.toString());
                                params.set('page', '1');
                                router.push(`/albums/models?${params.toString()}`);
                            }}
                            pageSizeOptions={[24, 48, 72, 100]}
                            variant="full"
                        />
                    )}
                </div>
            </StandardContainer>
        </div>
    );
}
