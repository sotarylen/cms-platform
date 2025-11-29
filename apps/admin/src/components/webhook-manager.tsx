'use client';

import { useState } from 'react';
import { saveWebhookAction, deleteWebhookAction } from '@/app/actions/settings';
import type { WebhookConfig } from '@/lib/types';

type Props = {
    initialWebhooks: WebhookConfig[];
};

export function WebhookManager({ initialWebhooks }: Props) {
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>(initialWebhooks);
    const [editing, setEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<WebhookConfig>>({});
    const [loading, setLoading] = useState(false);

    const handleEdit = (webhook: WebhookConfig) => {
        setEditing(webhook.id);
        setFormData(webhook);
    };

    const handleNew = () => {
        setEditing('new');
        setFormData({
            id: `webhook-${Date.now()}`,
            title: '',
            url: '',
            apiKey: '',
            description: '',
        });
    };

    const handleSave = async () => {
        if (!formData.title || !formData.url) {
            alert('标题和URL不能为空');
            return;
        }

        setLoading(true);
        const result = await saveWebhookAction(formData as WebhookConfig);

        if (result.success) {
            window.location.reload();
        } else {
            alert(result.error || '保存失败');
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('确定要删除此 Webhook 配置吗？')) {
            return;
        }

        setLoading(true);
        const result = await deleteWebhookAction(id);

        if (result.success) {
            window.location.reload();
        } else {
            alert(result.error || '删除失败');
        }
        setLoading(false);
    };

    const handleCancel = () => {
        setEditing(null);
        setFormData({});
    };

    return (
        <div className="webhook-manager">
            <div className="section-header">
                <h3>Webhook 配置</h3>
                <button onClick={handleNew} className="action-button action-button-primary">
                    <i className="fas fa-plus"></i> 添加 Webhook
                </button>
            </div>

            {editing && (
                <div className="webhook-form panel" style={{ marginTop: 16, marginBottom: 16 }}>
                    <h4>{editing === 'new' ? '新建 Webhook' : '编辑 Webhook'}</h4>

                    <div className="form-group">
                        <label>标题 *</label>
                        <input
                            type="text"
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="例如：抓取图册内容"
                        />
                    </div>

                    <div className="form-group">
                        <label>Webhook URL *</label>
                        <input
                            type="url"
                            value={formData.url || ''}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            placeholder="https://your-n8n.com/webhook/..."
                        />
                    </div>

                    <div className="form-group">
                        <label>API Key（可选）</label>
                        <input
                            type="text"
                            value={formData.apiKey || ''}
                            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                            placeholder="生产环境使用的 API Key"
                        />
                    </div>

                    <div className="form-group">
                        <label>描述（可选）</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="用途说明"
                            rows={3}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={handleSave} disabled={loading} className="action-button action-button-primary">
                            {loading ? '保存中...' : '保存'}
                        </button>
                        <button onClick={handleCancel} disabled={loading} className="action-button">
                            取消
                        </button>
                    </div>
                </div>
            )}

            <div className="webhook-list">
                {webhooks.map((webhook) => (
                    <div key={webhook.id} className="webhook-item panel" style={{ marginBottom: 12 }}>
                        <div>
                            <h4>{webhook.title}</h4>
                            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                                {webhook.url}
                            </p>
                            {webhook.apiKey && (
                                <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                                    <i className="fas fa-key"></i> API Key: {webhook.apiKey.substring(0, 10)}...
                                </p>
                            )}
                            {webhook.description && (
                                <p style={{ fontSize: 13, marginTop: 8 }}>{webhook.description}</p>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button onClick={() => handleEdit(webhook)} className="action-button">
                                <i className="fas fa-edit"></i> 编辑
                            </button>
                            <button onClick={() => handleDelete(webhook.id)} className="delete-button">
                                <i className="fas fa-trash"></i> 删除
                            </button>
                        </div>
                    </div>
                ))}

                {webhooks.length === 0 && !editing && (
                    <div className="placeholder-content">
                        <i className="fas fa-plug" style={{ fontSize: 48, color: 'var(--text-muted)' }}></i>
                        <h3>暂无 Webhook 配置</h3>
                        <p className="muted">点击上方按钮添加新的 Webhook</p>
                    </div>
                )}
            </div>
        </div>
    );
}
