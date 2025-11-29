'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlbumCover } from '@/components/album-cover';
import { StudioEditModal } from '@/components/studio-edit-modal';
import type { Album, AlbumStudio } from '@/lib/types';

type Props = {
    studio: AlbumStudio;
    albums: Album[];
};

export function StudioDetailClient({ studio: initialStudio, albums }: Props) {
    const [studio, setStudio] = useState(initialStudio);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleEditSuccess = () => {
        setShowEditModal(false);
        // Refresh the page to get updated data
        window.location.reload();
    };

    return (
        <>
            {/* Navigation */}
            <div className="panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link className="action-button" href="/albums/list">
                    <i className="fas fa-arrow-left"></i> 返回列表
                </Link>
                <button className="action-button" onClick={() => setShowEditModal(true)}>
                    <i className="fas fa-edit"></i> 编辑工作室
                </button>
            </div>

            {/* Studio Information */}
            <section className="panel">
                {studio.studio_cover_url && (
                    <div style={{ marginBottom: 24 }}>
                        <img
                            src={studio.studio_cover_url}
                            alt={studio.studio_name}
                            style={{
                                width: '100%',
                                maxHeight: 300,
                                objectFit: 'cover',
                                borderRadius: 8,
                            }}
                        />
                    </div>
                )}

                <h1>{studio.studio_name}</h1>
                <div className="pill-list" style={{ marginTop: 12 }}>
                    <span className="pill">工作室 ID: {studio.studio_id}</span>
                    {studio.studio_url && (
                        <a
                            href={studio.studio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pill"
                            style={{ cursor: 'pointer' }}
                        >
                            <i className="fas fa-external-link-alt"></i> 官网
                        </a>
                    )}
                </div>

                {studio.studio_intro && (
                    <div style={{ marginTop: 16 }}>
                        <h3>工作室简介</h3>
                        <p className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
                            {studio.studio_intro}
                        </p>
                    </div>
                )}
            </section>

            {/* Studio Albums */}
            <section className="panel">
                <h2>工作室图册 ({albums.length})</h2>

                {albums.length === 0 ? (
                    <p className="muted">该工作室暂无图册</p>
                ) : (
                    <div className="album-grid" style={{ marginTop: 16 }}>
                        {albums.map((album) => (
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

            {/* Edit Modal */}
            {showEditModal && (
                <StudioEditModal
                    studio={studio}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleEditSuccess}
                />
            )}
        </>
    );
}
