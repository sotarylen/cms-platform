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

export async function createUserAction(data: any) {
    try {
        await requireAdmin();
        const { createUser, usernameExists } = await import('@/lib/auth');

        if (await usernameExists(data.username)) {
            return { success: false, error: '用户名已存在' };
        }

        await createUser(data);
        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        console.error('Create user error:', error);
        return { success: false, error: '创建用户失败' };
    }
}

export async function updateUserAction(userId: number, data: any) {
    try {
        await requireAdmin();
        const { updateUser } = await import('@/lib/auth');

        await updateUser(userId, data);
        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        console.error('Update user error:', error);
        return { success: false, error: '更新用户失败' };
    }
}
