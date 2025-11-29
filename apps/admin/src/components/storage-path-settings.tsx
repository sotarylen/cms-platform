'use client';

import { useState } from 'react';
import { updateAlbumStoragePathAction } from '@/app/actions/settings';

type Props = {
    initialPath: string;
};

export function StoragePathSettings({ initialPath }: Props) {
    const [path, setPath] = useState(initialPath);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        setLoading(true);
        setMessage('');

        const result = await updateAlbumStoragePathAction(path);

        if (result.success) {
            setMessage('保存成功');
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage(`错误：${result.error}`);
        }

        setLoading(false);
    };

    return (
        <div className="storage-path-settings">
            <h3>图册存储路径</h3>
            <p className="muted" style={{ marginBottom: 16 }}>
                设置图册图片的本地存储路径。图片将按图册ID创建子文件夹存储。
            </p>

            <div className="form-group">
                <label>存储路径</label>
                <input
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="/path/to/albums"
                    style={{ fontFamily: 'monospace' }}
                />
                <small className="muted">
                    示例：/Users/username/albums 或 /var/www/albums
                </small>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="action-button action-button-primary"
                >
                    {loading ? '保存中...' : '保存'}
                </button>
                {message && (
                    <span className={message.includes('错误') ? 'text-danger' : 'text-success'}>
                        {message}
                    </span>
                )}
            </div>

            <div className="info-box" style={{ marginTop: 24 }}>
                <h4>路径结构说明</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    图片存储结构：<code>{path}/[albumId]/image001.jpg</code>
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                    例如：图册123的图片将存储在 <code>{path}/123/</code> 文件夹中
                </p>
            </div>
        </div>
    );
}
