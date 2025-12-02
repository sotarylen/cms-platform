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
    CardFooter,
} from "@/components/ui/card";
import { ArrowLeft, Edit, ExternalLink, List } from "lucide-react"
import { StudioLogo } from '@/components/studio-logo';
import { Pagination } from '@/components/pagination';
import { DetailNavBar } from '@/components/navigation/detail-nav-bar';
import { formatDate } from '@/lib/utils';
import { ContentCard } from '@/components/data-display/content-card';
import { StandardContainer } from '@/components/standard-container';

type Props = {
    studio: AlbumStudio;
    albums: Album[];
    total: number;
    page: number;
    pageSize: number;
    prevId: number | null;
    nextId: number | null;
};

export function StudioDetailClient({ studio: initialStudio, albums, total, page, pageSize, prevId, nextId }: Props) {
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
            >
                <div className="space-y-4">
                    {albums.length === 0 ? (
                        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                            <p className="text-muted-foreground">该工作室暂无图册</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {albums.filter(album => album.id && album.id !== 0).map((album) => (
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
