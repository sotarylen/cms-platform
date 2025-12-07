'use client';

import { useRouter } from 'next/navigation';
import { AlbumCover } from '@/components/album-cover';
import { ModelEditDialog } from '@/components/model-edit-dialog';
import type { Album, AlbumModel } from '@/lib/types';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, List, Users } from "lucide-react"
import { Pagination } from '@/components/pagination';
import { DetailNavBar } from '@/components/navigation/detail-nav-bar';
import { AlbumGrid } from '@/components/album/album-grid';
import { StandardContainer } from '@/components/standard-container';

type Props = {
    model: AlbumModel;
    albums: Album[];
    total: number;
    page: number;
    pageSize: number;
    prevId: number | null;
    nextId: number | null;
};

export function ModelDetailClient({ model, albums, total, page, pageSize, prevId, nextId }: Props) {
    const router = useRouter();

    const handlePageChange = (newPage: number) => {
        router.push(`/albums/models/${model.model_id}?page=${newPage}&pageSize=${pageSize}`);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        router.push(`/albums/models/${model.model_id}?page=1&pageSize=${newPageSize}`);
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
            >
                <div className="space-y-4">
                    {albums.length === 0 ? (
                        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                            <p className="text-muted-foreground">该模特暂无图册</p>
                        </div>
                    ) : (
                        <>
                            <AlbumGrid
                                albums={albums}
                                emptyMessage="该模特暂无图册"
                            />

                            <Pagination
                                total={total}
                                page={page}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                            />
                        </>
                    )}
                </div>
            </StandardContainer>
        </div>
    );
}
