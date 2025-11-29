'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerAction } from '@/app/actions/auth';

export function RegisterForm() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<'user' | 'admin'>('user');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        setLoading(true);

        const result = await registerAction({
            username,
            email: email || undefined,
            password,
            role,
        });

        if (result.success) {
            router.push('/');
            router.refresh();
        } else {
            setError(result.error || '注册失败');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
                <label htmlFor="username">用户名 *</label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    disabled={loading}
                    autoComplete="username"
                />
            </div>

            <div className="form-group">
                <label htmlFor="email">邮箱（可选）</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">密码 *</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={loading}
                    autoComplete="new-password"
                />
            </div>

            <div className="form-group">
                <label htmlFor="confirmPassword">确认密码 *</label>
                <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={loading}
                    autoComplete="new-password"
                />
            </div>

            <div className="form-group">
                <label htmlFor="role">角色</label>
                <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                    disabled={loading}
                >
                    <option value="user">普通用户</option>
                    <option value="admin">管理员</option>
                </select>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? '注册中...' : '注册'}
            </button>
        </form>
    );
}
