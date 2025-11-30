import bcrypt from 'bcrypt';
import { query } from './db';
import type { User, LoginCredentials, RegisterData, SessionUser } from './types';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Authenticate user with credentials
 */
export async function authenticateUser(
    credentials: LoginCredentials
): Promise<User | null> {
    const users = await query<any[]>(
        `SELECT id, username, email, password_hash, role, created_at
     FROM users 
     WHERE username = ? AND deleted_at IS NULL
     LIMIT 1`,
        [credentials.username]
    );

    const user = users[0];
    if (!user) {
        return null;
    }

    const isValid = await verifyPassword(credentials.password, user.password_hash);
    if (!isValid) {
        return null;
    }

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: new Date(user.created_at),
    };
}

/**
 * Create a new user
 */
export async function createUser(data: RegisterData): Promise<User> {
    const passwordHash = await hashPassword(data.password);
    const role = data.role || 'user';

    const result = await query<any>(
        `INSERT INTO users (username, email, password_hash, role, created_at, updated_at) 
     VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [data.username, data.email || null, passwordHash, role]
    );

    const users = await query<any[]>(
        `SELECT id, username, email, role, created_at, updated_at 
     FROM users 
     WHERE id = ?`,
        [result.insertId]
    );

    const user = users[0];
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: new Date(user.created_at),
    };
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
    const users = await query<any[]>(
        `SELECT id, username, email, role, created_at, updated_at 
     FROM users 
     WHERE id = ? AND deleted_at IS NULL
     LIMIT 1`,
        [id]
    );

    const user = users[0];
    if (!user) {
        return null;
    }

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: new Date(user.created_at),
    };
}

/**
 * Check if username already exists
 */
export async function usernameExists(username: string): Promise<boolean> {
    const users = await query<any[]>(
        `SELECT id FROM users WHERE username = ? AND deleted_at IS NULL LIMIT 1`,
        [username]
    );
    return users.length > 0;
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<User[]> {
    const users = await query<any[]>(
        `SELECT id, username, email, role, created_at, updated_at 
     FROM users 
     WHERE deleted_at IS NULL
     ORDER BY created_at DESC`
    );

    return users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: new Date(user.created_at),
    }));
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
    userId: number,
    role: 'admin' | 'user'
): Promise<void> {
    await query(
        `UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?`,
        [role, userId]
    );
}

/**
 * Soft delete user (admin only)
 */
export async function deleteUser(userId: number): Promise<void> {
    await query(
        `UPDATE users SET deleted_at = NOW() WHERE id = ?`,
        [userId]
    );
}

/**
 * Update user details (admin only)
 */
export async function updateUser(
    userId: number,
    data: { email?: string; password?: string; role?: 'admin' | 'user' }
): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.email !== undefined) {
        updates.push('email = ?');
        values.push(data.email || null);
    }

    if (data.password) {
        const passwordHash = await hashPassword(data.password);
        updates.push('password_hash = ?');
        values.push(passwordHash);
    }

    if (data.role) {
        updates.push('role = ?');
        values.push(data.role);
    }

    if (updates.length === 0) return;

    values.push(userId);

    await query(
        `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
    );
}
