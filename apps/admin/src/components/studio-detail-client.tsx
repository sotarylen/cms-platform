'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlbumCover } from '@/components/album-cover';
import { StudioEditModal } from '@/components/studio-edit-modal';
import type { Album, AlbumStudio } from '@/lib/types';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ArrowLeft, Edit, ExternalLink } from "lucide-react"
import { StudioLogo } from '@/components/studio-logo';
import { Pagination } from '@/components/pagination';
import { formatDate } from '@/lib/utils';

type Props = {
    studio: AlbumStudio;
    albums: Album[];
    total: number;
    page: number;
    pageSize: number;
};

export function StudioDetailClient({ studio: initialStudio, albums, total, page, pageSize }: Props) {
    const [studio, setStudio] = useState(initialStudio);
    const [showEditModal, setShowEditModal] = useState(false);
    const router = useRouter();

    const handleEditSuccess = () => {
        setShowEditModal(false);
        window.location.reload();
    };

    const handlePageChange = (newPage: number) => {
        router.push(`/albums/studios/${studio.studio_id}?page=${newPage}&pageSize=${pageSize}`);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        router.push(`/albums/studios/${studio.studio_id}?page=1&pageSize=${newPageSize}`);
    };

    return (
        <div className="space-y-6">
            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="pl-0">
                    <Link href="/albums/studios">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        返回列表
                    </Link>
                </Button>
                <Button onClick={() => setShowEditModal(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    编辑工作室
                </Button>
            </div>

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
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>工作室图册 ({total})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {albums.length === 0 ? (
                        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                            <p className="text-muted-foreground">该工作室暂无图册</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {albums.map((album) => (
                                    <Card key={album.id} className="overflow-hidden group">
                                        <Link href={`/albums/${album.id}`}>
                                            <div className="aspect-[2/3] overflow-hidden bg-muted relative">
                                                <AlbumCover
                                                    src={album.source_page_url || ''}
                                                    alt={album.resource_title_raw}
                                                    className="h-full w-full object-cover transition-all group-hover:scale-105"
                                                />
                                                {album.model_name && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-xs truncate">
                                                        {album.model_name}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                        <CardContent className="p-3 space-y-1">
                                            <h3 className="font-medium text-sm truncate" title={album.resource_title_raw}>
                                                <Link href={`/albums/${album.id}`} className="hover:underline">
                                                    {album.resource_title_raw}
                                                </Link>
                                            </h3>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>#{album.id}</span>
                                                <span>{formatDate(album.created_at)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <Pagination
                                total={total}
                                page={page}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                            />
                        </>
                    )}
                </CardContent>
            </Card>

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
