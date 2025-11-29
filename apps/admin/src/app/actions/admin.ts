'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/session';
import { updateUserRole, deleteUser } from '@/lib/auth';

export async function updateUserRoleAction(userId: number, role: 'admin' | 'user') {
    try {
        await requireAdmin();
        await updateUserRole(userId, role);
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Update user role error:', error);
        return { success: false, error: '更新用户角色失败' };
    }
}

export async function deleteUserAction(userId: number) {
    try {
        await requireAdmin();
        await deleteUser(userId);
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Delete user error:', error);
        return { success: false, error: '删除用户失败' };
    }
}
