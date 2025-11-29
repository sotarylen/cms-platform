'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { UserMenu } from './user-menu';
import type { SessionUser } from '@/lib/types';

type Props = {
    user: SessionUser | null;
};

export function HeaderClient({ user }: Props) {
    const pathname = usePathname();
    const isChapterReader =
        pathname?.startsWith('/books/') && pathname.includes('/chapters/');

    if (isChapterReader) {
        return null;
    }

    return (
        <header className="app-header">
            <div className="header-content">
                {/* Logo */}
                <h1 className="logo">CMS Platform</h1>

                {/* Navigation */}
                <nav className="header-nav">
                    <Link
                        href="/"
                        className={clsx('nav-link', {
                            active: pathname === '/' && !pathname.startsWith('/albums') && !pathname.startsWith('/books/')
                        })}
                    >
                        <i className="fas fa-home"></i>
                        <span>首页</span>
                    </Link>
                    <Link
                        href="/"
                        className={clsx('nav-link', {
                            active: pathname === '/' || (pathname?.startsWith('/books/') && !pathname.includes('/chapters/'))
                        })}
                    >
                        <i className="fas fa-book"></i>
                        <span>小说</span>
                    </Link>
                    <Link
                        href="/albums"
                        className={clsx('nav-link', { active: pathname?.startsWith('/albums') })}
                    >
                        <i className="fas fa-images"></i>
                        <span>图册</span>
                    </Link>
                </nav>

                {/* Auth Section */}
                <div className="header-right">
                    <div className="header-actions">
                        {user ? (
                            <UserMenu user={user} />
                        ) : (
                            <div className="auth-buttons">
                                <Link href="/auth/login" className="button secondary">
                                    <i className="fas fa-sign-in-alt"></i>
                                    <span>登录</span>
                                </Link>
                                <Link href="/auth/register" className="button primary">
                                    <i className="fas fa-user-plus"></i>
                                    <span>注册</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
