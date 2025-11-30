'use client';

import { useState } from 'react';
import { saveWebhookAction, deleteWebhookAction } from '@/app/actions/settings';
import type { WebhookConfig } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2, Plus, Save, Loader2 } from 'lucide-react';

type Props = {
    initialWebhooks: WebhookConfig[];
};

export function WebhookManager({ initialWebhooks }: Props) {
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>(initialWebhooks);
    const [loading, setLoading] = useState(false);

    // New webhook state
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = async () => {
        if (!newTitle || !newUrl) {
            toast.error('标题和URL不能为空');
            return;
        }

        setLoading(true);
        const newWebhook: WebhookConfig = {
            id: `webhook-${Date.now()}`,
            title: newTitle,
            url: newUrl,
            apiKey: '',
            description: '',
        };

        const result = await saveWebhookAction(newWebhook);

        if (result.success) {
            toast.success('添加成功');
            setWebhooks([...webhooks, newWebhook]);
            setNewTitle('');
            setNewUrl('');
            setIsAdding(false);
        } else {
            toast.error(result.error || '添加失败');
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('确定要删除此 Webhook 配置吗？')) {
            return;
        }

        const result = await deleteWebhookAction(id);

        if (result.success) {
            toast.success('删除成功');
            setWebhooks(webhooks.filter(w => w.id !== id));
        } else {
            toast.error(result.error || '删除失败');
        }
    };

    const handleUpdate = async (webhook: WebhookConfig, field: keyof WebhookConfig, value: string) => {
        const updatedWebhook = { ...webhook, [field]: value };

        // Optimistic update
        setWebhooks(webhooks.map(w => w.id === webhook.id ? updatedWebhook : w));

        // Debounce could be added here for auto-save, but for now we'll just update local state
        // and let user click a save button if we wanted strict save, 
        // but for "simplified" UI, maybe we just want direct editing?
        // Let's stick to the requested "Label Field Description" layout, 
        // but since it's a list, we need a way to add/remove.

        // Actually, for a list of items, a grid layout per item works best.
    };

    const handleSaveItem = async (webhook: WebhookConfig) => {
        const result = await saveWebhookAction(webhook);
        if (result.success) {
            toast.success('保存成功');
        } else {
            toast.error(result.error || '保存失败');
        }
    }

    return (
        <div className="space-y-6">
            {/* Existing Webhooks */}
            {webhooks.map((webhook) => (
                <div key={webhook.id} className="grid grid-cols-[200px_1fr_100px] gap-4 items-start border-b pb-6 last:border-0">
                    <div className="space-y-2">
                        <Input
                            value={webhook.title}
                            onChange={(e) => handleUpdate(webhook, 'title', e.target.value)}
                            className="font-medium"
                            placeholder="Webhook 标题"
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            value={webhook.url}
                            onChange={(e) => handleUpdate(webhook, 'url', e.target.value)}
                            className="font-mono text-sm"
                            placeholder="https://..."
                        />
                        <p className="text-xs text-muted-foreground">
                            {webhook.description || '无描述'}
                        </p>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveItem(webhook)}
                            title="保存"
                        >
                            <Save className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(webhook.id)}
                            className="text-destructive hover:text-destructive"
                            title="删除"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}

            {/* Add New Webhook */}
            {isAdding ? (
                <div className="grid grid-cols-[200px_1fr_100px] gap-4 items-start bg-muted/30 p-4 rounded-lg">
                    <div className="space-y-2">
                        <Label>标题</Label>
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="例如：抓取章节"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="https://..."
                            className="font-mono"
                        />
                    </div>
                    <div className="flex gap-2 pt-8 justify-end">
                        <Button onClick={handleAdd} disabled={loading} size="sm">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '添加'}
                        </Button>
                        <Button variant="ghost" onClick={() => setIsAdding(false)} size="sm">
                            取消
                        </Button>
                    </div>
                </div>
            ) : (
                <Button variant="outline" onClick={() => setIsAdding(true)} className="w-full border-dashed">
                    <Plus className="mr-2 h-4 w-4" />
                    添加 Webhook
                </Button>
            )}
        </div>
    );
}
