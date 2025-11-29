'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import { updateUserRoleAction, deleteUserAction } from '@/app/actions/admin';
import type { User } from '@/lib/types';

type Props = {
    users: User[];
};

export function UserManagementTable({ users }: Props) {
    const [loading, setLoading] = useState<number | null>(null);

    const handleRoleChange = async (userId: number, newRole: 'admin' | 'user') => {
        if (!confirm(`确定要将此用户角色更改为${newRole === 'admin' ? '管理员' : '普通用户'}吗？`)) {
            return;
        }

        setLoading(userId);
        const result = await updateUserRoleAction(userId, newRole);
        setLoading(null);

        if (!result.success) {
            alert(result.error || '更新失败');
        }
    };

    const handleDelete = async (userId: number, username: string) => {
        if (!confirm(`确定要删除用户 "${username}" 吗？此操作不可撤销。`)) {
            return;
        }

        setLoading(userId);
        const result = await deleteUserAction(userId);
        setLoading(null);

        if (!result.success) {
            alert(result.error || '删除失败');
        }
    };

    return (
        <table className="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>用户名</th>
                    <th>邮箱</th>
                    <th>角色</th>
                    <th>创建时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                    <tr key={user.id}>
                        <td>#{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email || '—'}</td>
                        <td>
                            <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'user')}
                                disabled={loading === user.id}
                                className="role-select"
                            >
                                <option value="user">普通用户</option>
                                <option value="admin">管理员</option>
                            </select>
                        </td>
                        <td>{formatDate(user.created_at)}</td>
                        <td>
                            <button
                                onClick={() => handleDelete(user.id, user.username)}
                                disabled={loading === user.id}
                                className="delete-button"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
