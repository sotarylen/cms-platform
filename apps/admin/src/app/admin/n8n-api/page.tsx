import { getSettings } from '@/lib/config';
import { WebhookManager } from '@/components/webhook-manager';

export default async function N8nApiPage() {
    const settings = await getSettings();

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>n8n 接口管理</h1>
                <p className="muted">管理 n8n Webhook 配置</p>
            </div>

            <section className="panel">
                <WebhookManager initialWebhooks={settings.webhooks} />
            </section>
        </div>
    );
}
