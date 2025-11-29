import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { SessionUser } from './types';

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createSession(user: SessionUser) {
    const token = await new SignJWT({ user })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(SECRET_KEY);

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION / 1000,
        path: '/',
    });
}

export async function getSession(): Promise<SessionUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload.user as SessionUser;
    } catch (error) {
        return null;
    }
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}

export async function isAdmin(): Promise<boolean> {
    const user = await getSession();
    return user?.role === 'admin';
}

export async function requireAuth(): Promise<SessionUser> {
    const user = await getSession();
    if (!user) {
        throw new Error('Unauthorized');
    }
    return user;
}

export async function requireAdmin(): Promise<SessionUser> {
    const user = await requireAuth();
    if (user.role !== 'admin') {
        throw new Error('Forbidden: Admin access required');
    }
    return user;
}
