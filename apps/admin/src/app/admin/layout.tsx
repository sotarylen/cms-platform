import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAdmin } from '@/lib/session';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    try {
        await requireAdmin();
    } catch (error) {
        redirect('/');
    }

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>后台管理</h2>
                </div>
                <nav className="admin-nav">
                    <Link href="/admin" className="admin-nav-item">
                        <i className="fas fa-tachometer-alt"></i>
                        概览
                    </Link>
                    <Link href="/admin/users" className="admin-nav-item">
                        <i className="fas fa-users"></i>
                        用户管理
                    </Link>
                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-section">预留功能</div>
                    <Link href="/admin/settings" className="admin-nav-item">
                        <i className="fas fa-cog"></i>
                        设置管理
                    </Link>
                    <Link href="/admin/data-sources" className="admin-nav-item disabled">
                        <i className="fas fa-database"></i>
                        数据来源管理
                    </Link>
                    <Link href="/admin/n8n-api" className="admin-nav-item">
                        <i className="fas fa-plug"></i>
                        n8n接口管理
                    </Link>
                    <Link href="/admin/database" className="admin-nav-item disabled">
                        <i className="fas fa-table"></i>
                        数据表结构管理
                    </Link>
                </nav>
                <div className="admin-sidebar-footer">
                    <Link href="/" className="admin-back-link">
                        <i className="fas fa-arrow-left"></i>
                        返回首页
                    </Link>
                </div>
            </aside>
            <main className="admin-content">
                {children}
            </main>
        </div>
    );
}
