import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { RegisterForm } from '@/components/register-form';

export default async function RegisterPage() {
    const user = await getSession();

    // If already logged in, redirect to home
    if (user) {
        redirect('/');
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">注册</h1>
                <p className="auth-subtitle">创建您的 Novel CMS Platform 账号</p>

                <RegisterForm />

                <div className="auth-footer">
                    已有账号？
                    <Link href="/auth/login" className="auth-link">
                        立即登录
                    </Link>
                </div>
            </div>
        </div>
    );
}
