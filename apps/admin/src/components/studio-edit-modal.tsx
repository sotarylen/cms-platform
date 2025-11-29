'use client';

import { useState } from 'react';
import type { AlbumStudio } from '@/lib/types';

type Props = {
    studio: AlbumStudio;
    onClose: () => void;
    onSuccess: () => void;
};

export function StudioEditModal({ studio, onClose, onSuccess }: Props) {
    const [intro, setIntro] = useState(studio.studio_intro || '');
    const [coverUrl, setCoverUrl] = useState(studio.studio_cover_url || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/studios/${studio.studio_id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studio_intro: intro,
                    studio_cover_url: coverUrl,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || '更新失败');
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message || '发生未知错误');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>编辑工作室信息</h2>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="auth-error" style={{ marginBottom: 16 }}>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="studio-intro">工作室简介</label>
                            <textarea
                                id="studio-intro"
                                className="form-input"
                                value={intro}
                                onChange={(e) => setIntro(e.target.value)}
                                rows={5}
                                placeholder="输入工作室简介..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="studio-cover">封面图片 URL</label>
                            <input
                                id="studio-cover"
                                type="text"
                                className="form-input"
                                value={coverUrl}
                                onChange={(e) => setCoverUrl(e.target.value)}
                                placeholder="https://example.com/cover.jpg"
                            />
                            {coverUrl && (
                                <div style={{ marginTop: 12 }}>
                                    <img
                                        src={coverUrl}
                                        alt="封面预览"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: 200,
                                            objectFit: 'contain',
                                            borderRadius: 8,
                                            border: '1px solid var(--border)',
                                        }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="button secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="button primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '保存中...' : '保存'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
