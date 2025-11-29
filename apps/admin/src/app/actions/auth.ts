'use server';

import { redirect } from 'next/navigation';
import { authenticateUser, createUser, usernameExists } from '@/lib/auth';
import { createSession, deleteSession } from '@/lib/session';
import type { LoginCredentials, RegisterData } from '@/lib/types';

export async function loginAction(credentials: LoginCredentials) {
    try {
        const user = await authenticateUser(credentials);

        if (!user) {
            return { success: false, error: '用户名或密码错误' };
        }

        await createSession(user);
        return { success: true };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: '登录失败，请稍后重试' };
    }
}

export async function registerAction(data: RegisterData) {
    try {
        // Validate input
        if (!data.username || data.username.length < 3) {
            return { success: false, error: '用户名至少需要3个字符' };
        }

        if (!data.password || data.password.length < 8) {
            return { success: false, error: '密码至少需要8个字符' };
        }

        // Check if username exists
        const exists = await usernameExists(data.username);
        if (exists) {
            return { success: false, error: '用户名已存在' };
        }

        // Create user
        const user = await createUser(data);

        // Create session
        await createSession({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        });

        return { success: true };
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, error: '注册失败，请稍后重试' };
    }
}

export async function logoutAction() {
    await deleteSession();
    redirect('/');
}
