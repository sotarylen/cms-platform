import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAlbumById } from '@/lib/queries';
import { getAlbumImages } from '@/lib/album-images';
import { getAlbumStoragePath } from '@/lib/config';
import { formatDate } from '@/lib/utils';
import { AlbumImagesGallery } from '@/components/album-images-gallery';
import dynamic from 'next/dynamic';

const AlbumFetchButton = dynamic(() => import('@/components/album-fetch-button'));

type PageProps = {
    params: { id: string };
};

export default async function AlbumDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    const albumId = Number(resolvedParams.id);

    // 获取图册信息
    const album = await getAlbumById(albumId);

    if (!album) {
        notFound();
    }

    // 获取图片列表
    const images = getAlbumImages(albumId);
    const storagePath = getAlbumStoragePath();

    return (
        <>
            {/* 导航栏 */}
            <div className="panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link className="action-button" href="/albums/list">
                    <i className="fas fa-arrow-left"></i> 返回列表
                </Link>
            </div>

            {/* 图册基本信息 */}
            <section className="panel">
                <div className="album-detail-header">
                    <h1>{album.resource_title_raw}</h1>
                    <div className="pill-list" style={{ marginTop: 12 }}>
                        {album.model_name && <span className="pill">模特：{album.model_name}</span>}
                        {album.studio_name && <span className="pill">机构：{album.studio_name}</span>}
                        <span className="pill">创建时间：{formatDate(album.created_at)}</span>
                        <span className="pill">图片数量：{images.length}</span>
                    </div>

                    {album.resource_url && (
                        <div style={{ marginTop: 16 }}>
                            <a
                                href={album.resource_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="action-button"
                            >
                                <i className="fas fa-external-link-alt"></i> 查看原文
                            </a>
                        </div>
                    )}

                    <div className="album-actions" style={{ marginTop: 16 }}>
                        <AlbumFetchButton
                            albumId={album.id}
                            albumTitle={album.resource_title_raw}
                        />
                    </div>
                </div>
            </section>

            {/* 图片画廊 */}
            <section className="panel">
                <h2>图片展示</h2>
                <AlbumImagesGallery
                    albumId={albumId}
                    images={images}
                    storagePath={storagePath}
                />
            </section>
        </>
    );
}
