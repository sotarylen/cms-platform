import Link from 'next/link';
import AnimatedNumber from '@/components/animated-number';
import { getAlbumStats, getLatestAlbums } from '@/lib/queries';
import { AlbumCover } from '@/components/album-cover';

export const dynamic = 'force-dynamic';

export default async function AlbumsDashboard() {
    const stats = await getAlbumStats();
    const latestAlbums = await getLatestAlbums(12);

    return (
        <>
            <section className="panel">
                <h2>图集数据一览</h2>
                <div className="stats-grid">
                    <article className="stat-card stat-books">
                        <p className="stat-label">总图集数</p>
                        <p className="stat-value">
                            <AnimatedNumber value={stats.albums} duration={1000} />
                        </p>
                    </article>
                    <article className="stat-card stat-directory">
                        <p className="stat-label">总模特数</p>
                        <p className="stat-value">
                            <AnimatedNumber value={stats.models} duration={1000} />
                        </p>
                    </article>
                    <article className="stat-card stat-contents">
                        <p className="stat-label">总机构数</p>
                        <p className="stat-value">
                            <AnimatedNumber value={stats.studios} duration={1000} />
                        </p>
                    </article>
                </div>
            </section>

            <section className="panel" style={{ marginTop: '20px' }}>
                <div className="album-list-header">
                    <h2>最新图册</h2>
                    <Link href="/albums/list" className="action-button">
                        <i className="fas fa-th-list"></i>
                        全部图册
                    </Link>
                </div>

                {latestAlbums.length === 0 ? (
                    <p className="muted">暂无图册</p>
                ) : (
                    <div className="album-grid">
                        {latestAlbums.map((album) => (
                            <Link
                                key={album.id}
                                href={`/albums/${album.id}`}
                                className="album-card-link"
                            >
                                <div className="album-card">
                                    <div className="album-cover">
                                        <AlbumCover
                                            src={album.source_page_url}
                                            alt={album.resource_title_raw}
                                        />
                                    </div>
                                    <div className="album-info">
                                        <h3 className="album-title">{album.resource_title_raw}</h3>
                                        <div className="album-meta">
                                            {album.studio_name && (
                                                <span className="muted">{album.studio_name}</span>
                                            )}
                                            {album.model_name && (
                                                <span className="muted">{album.model_name}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
