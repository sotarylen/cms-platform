import { getAllUsers } from '@/lib/auth';

export default async function AdminPage() {
    const users = await getAllUsers();

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>后台管理概览</h1>
                <p className="muted">管理系统概览和快捷操作</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">总用户数</div>
                    <div className="stat-value">{users.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">管理员</div>
                    <div className="stat-value">
                        {users.filter((u) => u.role === 'admin').length}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">普通用户</div>
                    <div className="stat-value">
                        {users.filter((u) => u.role === 'user').length}
                    </div>
                </div>
            </div>

            <section className="panel" style={{ marginTop: 24 }}>
                <h2>快捷操作</h2>
                <div className="admin-quick-actions">
                    <a href="/admin/users" className="action-button action-button-primary">
                        <i className="fas fa-users"></i>
                        管理用户
                    </a>
                    <a href="/" className="action-button">
                        <i className="fas fa-book"></i>
                        查看小说
                    </a>
                    <a href="/albums" className="action-button">
                        <i className="fas fa-images"></i>
                        查看图集
                    </a>
                </div>
            </section>
        </div>
    );
}
