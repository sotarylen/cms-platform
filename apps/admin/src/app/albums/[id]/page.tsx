import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAlbumById, getAdjacentAlbums, getModels, getStudios } from '@/lib/data/albums';
import { getAlbumImages, getAlbumVideos } from '@/lib/album-images';
import { getAlbumStoragePath } from '@/lib/config';
import { formatDate } from '@/lib/utils';
import { AlbumImagesGallery } from '@/components/album-images-gallery';
import { AlbumVideoGallery } from '@/components/album-video-gallery';
import { BackButton } from '@/components/back-button';
import { AlbumEditDialog } from '@/components/album-edit-dialog';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Calendar, Image as ImageIcon, User, Building2, ChevronLeft, ChevronRight, Edit, ArrowLeft } from "lucide-react";
import { DetailNavBar } from '@/components/navigation/detail-nav-bar';

const AlbumFetchButton = dynamic(() => import('@/components/album-fetch-button'));

type PageProps = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ page?: string; pageSize?: string }>;
};


export default async function AlbumDetailPage({ params, searchParams }: PageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const albumId = Number(resolvedParams.id);
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 20;

    // 获取图册信息
    const album = await getAlbumById(albumId);

    if (!album) {
        notFound();
    }

    // 获取相邻图册
    const { prevId, nextId } = await getAdjacentAlbums(albumId);

    // 获取图片列表
    const allImages = getAlbumImages(albumId);
    const totalImages = allImages.length;
    const storagePath = getAlbumStoragePath();

    // 获取视频列表
    const videos = getAlbumVideos(albumId);

    // 获取模特和工作室列表
    const models = await getModels();
    const studios = await getStudios();

    return (
        <div className="space-y-6">
            {/* 导航栏 */}
            <DetailNavBar
                backButton={{
                    href: null, // 使用浏览器后退
                    label: "返回列表",
                    icon: <ArrowLeft className="h-4 w-4" />
                }}
                navigation={{
                    prevHref: prevId ? `/albums/${prevId}` : null,
                    prevLabel: "上一个",
                    listHref: "/albums",
                    listLabel: "全部图册",
                    listIcon: <ImageIcon className="h-4 w-4" />,
                    nextHref: nextId ? `/albums/${nextId}` : null,
                    nextLabel: "下一个"
                }}
            />

            {/* 图册基本信息 */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* 左侧封面 */}
                        <div className="w-full md:w-48 flex-shrink-0">
                            <div className="aspect-[2/3] relative rounded-lg overflow-hidden border bg-muted shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={album.source_page_url}
                                    alt={album.title || album.resource_title_raw}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* 右侧信息 */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-2xl font-bold leading-tight mb-2">
                                    {album.title || album.resource_title_raw}
                                </h1>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <span className="h-3 w-3">#</span> {albumId}
                                    </Badge>
                                    {album.model_name && album.model_id && album.model_id > 0 ? (
                                        <Link href={`/albums/models/${album.model_id}`}>
                                            <Badge variant="secondary" className="flex items-center gap-1 cursor-pointer hover:bg-accent transition-colors">
                                                <User className="h-3 w-3" /> {album.model_name}
                                            </Badge>
                                        </Link>
                                    ) : album.model_name ? (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <User className="h-3 w-3" /> {album.model_name}
                                        </Badge>
                                    ) : null}
                                    {album.studio_name && album.studio_id && album.studio_id > 0 ? (
                                        <Link href={`/albums/studios/${album.studio_id}`}>
                                            <Badge variant="outline" className="flex items-center gap-1 cursor-pointer hover:bg-accent transition-colors">
                                                <Building2 className="h-3 w-4" /> {album.studio_name}
                                            </Badge>
                                        </Link>
                                    ) : album.studio_name ? (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Building2 className="h-3 w-3" /> {album.studio_name}
                                        </Badge>
                                    ) : null}
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {formatDate(album.created_at)}
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <ImageIcon className="h-3 w-3" /> {totalImages} 张图片
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                {album.resource_url && (
                                    <Button variant="outline" size="sm" asChild>
                                        <a
                                            href={album.resource_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" /> 查看原文
                                        </a>
                                    </Button>
                                )}
                                <AlbumFetchButton
                                    albumId={album.id}
                                    albumTitle={album.title || album.resource_title_raw}
                                />
                                <AlbumEditDialog
                                    album={album}
                                    models={models}
                                    studios={studios}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 视频展示区域 */}
            <AlbumVideoGallery albumId={albumId} videos={videos} />

            {/* 图片画廊 */}
            <Card>
                <CardContent className="p-6">
                    <AlbumImagesGallery
                        albumId={albumId}
                        images={allImages}
                        storagePath={storagePath}
                        total={totalImages}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
