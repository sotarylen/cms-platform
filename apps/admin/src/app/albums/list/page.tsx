import Link from 'next/link';
import { getAlbums } from '@/lib/queries';
import { formatDate } from '@/lib/utils';
import { PaginationControls } from '@/components/pagination-controls';
import { AlbumCover } from '@/components/album-cover';

export const dynamic = 'force-dynamic';

export default async function AlbumList({ searchParams }: any) {
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const view = resolvedSearchParams.view || 'list';
    const pageSize = 30;

    const { items, total } = await getAlbums({ page, pageSize });

    return (
        <section className="panel">
            <div className="album-list-header">
                <h2>图集列表</h2>
                <div className="view-toggle">
                    <Link
                        href={`/albums/list?view=list&page=${page}`}
                        className={`button ${view === 'list' ? 'primary' : 'secondary'}`}
                    >
                        <i className="fas fa-list"></i> 列表
                    </Link>
                    <Link
                        href={`/albums/list?view=grid&page=${page}`}
                        className={`button ${view === 'grid' ? 'primary' : 'secondary'}`}
                    >
                        <i className="fas fa-th"></i> 网格
                    </Link>
                </div>
            </div>

            {view === 'grid' ? (
                <div className="album-grid">
                    {items.map((album) => (
                        <Link key={album.id} href={`/albums/${album.id}`} className="album-card-link">
                            <div className="album-card">
                                <div className="album-cover">
                                    <AlbumCover
                                        src={album.source_page_url || ''}
                                        alt={album.resource_title_raw}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div className="album-cover-overlay">
                                        <span>{album.model_name}</span>
                                    </div>
                                </div>
                                <div className="album-info">
                                    <h3 className="album-title" title={album.resource_title_raw}>
                                        {album.resource_title_raw}
                                    </h3>
                                    <div className="album-meta">
                                        {album.studio_id && album.studio_name ? (
                                            <Link href={`/albums/studios/${album.studio_id}`} className="album-link">
                                                {album.studio_name}
                                            </Link>
                                        ) : (
                                            <span>{album.studio_name}</span>
                                        )}
                                        <span>{formatDate(album.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>封面</th>
                            <th>标题</th>
                            <th>机构</th>
                            <th>模特</th>
                            <th>创建时间</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((album) => (
                            <tr key={album.id}>
                                <td>
                                    <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
                                        #{album.id}
                                    </span>
                                </td>
                                <td>
                                    <div className="album-thumbnail">
                                        <AlbumCover
                                            src={album.source_page_url || ''}
                                            alt="Cover"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className="album-title-cell">
                                        <Link href={`/albums/${album.id}`} className="album-title-main">
                                            {album.resource_title_raw}
                                        </Link>
                                        <a href={album.resource_url} target="_blank" rel="noopener noreferrer" className="album-link">
                                            <i className="fas fa-external-link-alt"></i> 原文链接
                                        </a>
                                    </div>
                                </td>
                                <td>
                                    {album.studio_id && album.studio_name ? (
                                        <Link href={`/albums/studios/${album.studio_id}`} className="album-link">
                                            {album.studio_name}
                                        </Link>
                                    ) : (
                                        <span>{album.studio_name || '—'}</span>
                                    )}
                                </td>
                                <td>{album.model_name || album.model || '—'}</td>
                                <td>{formatDate(album.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div style={{ marginTop: 20 }}>
                <PaginationControls
                    total={total}
                    page={page}
                    pageSize={pageSize}
                    pathname="/albums/list"
                    searchParams={resolvedSearchParams}
                />
            </div>
        </section>
    );
}
