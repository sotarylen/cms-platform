'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import { updateUserRoleAction, deleteUserAction } from '@/app/actions/admin';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

type Props = {
    users: User[];
    onEdit: (user: User) => void;
};

export function UserManagementTable({ users, onEdit }: Props) {
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
        <div className="rounded-md border">
            <table className="w-full">
                <thead>
                    <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">用户名</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">邮箱</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">角色</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">创建时间</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">
                                <span className="text-sm font-semibold text-muted-foreground">#{user.id}</span>
                            </td>
                            <td className="p-4 align-middle font-medium">{user.username}</td>
                            <td className="p-4 align-middle text-sm">{user.email || '—'}</td>
                            <td className="p-4 align-middle">
                                <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'user')}
                                    disabled={loading === user.id}
                                    className="h-8 w-24 rounded border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="user">普通用户</option>
                                    <option value="admin">管理员</option>
                                </select>
                            </td>
                            <td className="p-4 align-middle text-sm text-muted-foreground">
                                {formatDate(user.createdAt)}
                            </td>
                            <td className="p-4 align-middle">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(user)}
                                        disabled={loading === user.id}
                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(user.id, user.username)}
                                        disabled={loading === user.id}
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
