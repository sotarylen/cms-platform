import { getSettingsAction } from '@/app/actions/settings';
import { WebhookManager } from '@/components/webhook-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function WebhookSettingsPage() {
    const result = await getSettingsAction();
    const webhooks = result.success && result.data ? result.data.webhooks : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Webhook 配置</h1>
                    <p className="text-muted-foreground mt-2">管理 n8n webhook 和外部集成</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Webhook 列表</CardTitle>
                    <CardDescription>
                        配置用于触发外部工作流的 Webhook URL。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <WebhookManager initialWebhooks={webhooks} />
                </CardContent>
            </Card>
        </div>
    );
}
