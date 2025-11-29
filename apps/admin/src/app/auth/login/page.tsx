import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { LoginForm } from '@/components/login-form';

export default async function LoginPage() {
    const user = await getSession();

    // If already logged in, redirect to home
    if (user) {
        redirect('/');
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">登录</h1>
                <p className="auth-subtitle">登录到 Novel CMS Platform</p>

                <LoginForm />

                <div className="auth-footer">
                    还没有账号？
                    <Link href="/auth/register" className="auth-link">
                        立即注册
                    </Link>
                </div>
            </div>
        </div>
    );
}
