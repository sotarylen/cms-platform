import { getSettings } from '@/lib/config';
import { StoragePathSettings } from '@/components/storage-path-settings';

export default async function SettingsPage() {
    const settings = await getSettings();

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>设置管理</h1>
                <p className="muted">系统设置和配置</p>
            </div>

            <section className="panel">
                <StoragePathSettings initialPath={settings.albumStoragePath} />
            </section>
        </div>
    );
}
