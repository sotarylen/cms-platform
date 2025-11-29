import { getAllUsers } from '@/lib/auth';
import { UserManagementTable } from '@/components/user-management-table';

export default async function UsersPage() {
    const users = await getAllUsers();

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>用户管理</h1>
                <p className="muted">管理系统中的所有用户</p>
            </div>

            <section className="panel">
                <div className="section-header">
                    <h2>用户列表</h2>
                    <span className="muted">共 {users.length} 个用户</span>
                </div>
                <UserManagementTable users={users} />
            </section>
        </div>
    );
}
