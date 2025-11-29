'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { logoutAction } from '@/app/actions/auth';
import type { SessionUser } from '@/lib/types';

type Props = {
    user: SessionUser;
};

export function UserMenu({ user }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logoutAction();
    };

    // Get trigger button position for dropdown placement
    const getDropdownStyle = (): React.CSSProperties => {
        if (!triggerRef.current) return {};
        const rect = triggerRef.current.getBoundingClientRect();
        return {
            position: 'fixed',
            top: `${rect.bottom + 12}px`,
            right: `${window.innerWidth - rect.right}px`,
        };
    };

    return (
        <div className="user-menu">
            <button
                ref={triggerRef}
                className="user-menu-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <i className="fas fa-user-circle"></i>
                <span>{user.username}</span>
                <i className={`fas fa-chevron-down user-menu-arrow ${isOpen ? 'open' : ''}`}></i>
            </button>

            {mounted && isOpen && createPortal(
                <div
                    ref={menuRef}
                    className="user-menu-dropdown"
                    style={getDropdownStyle()}
                >
                    <div className="user-menu-header">
                        <div className="user-menu-name">{user.username}</div>
                        <div className="user-menu-role">
                            {user.role === 'admin' ? '管理员' : '普通用户'}
                        </div>
                    </div>

                    <div className="user-menu-divider"></div>

                    {user.role === 'admin' && (
                        <>
                            <Link href="/admin" className="user-menu-item">
                                <i className="fas fa-cog"></i>
                                后台管理
                            </Link>
                            <div className="user-menu-divider"></div>
                        </>
                    )}

                    <button onClick={handleLogout} className="user-menu-item">
                        <i className="fas fa-sign-out-alt"></i>
                        退出登录
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
}
